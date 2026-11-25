import {
  completeMultipartUpload,
  getMultipartUploadStatus,
  initiateMultipartUpload,
  signMultipartUploadParts,
} from "@/api/contentSlice";

type UploadOptions = {
  mediaKind: "main" | "trailer";
  target: "vod" | "episode";
  onProgress?: (percent: number) => void;
};

const STORAGE_PREFIX = "reeplay-multipart-v1";
const CONCURRENCY = 3;
const SIGNING_BATCH = 25;

const fingerprint = (file: File, options: UploadOptions) =>
  `${STORAGE_PREFIX}:${options.target}:${options.mediaKind}:${file.name}:${file.size}:${file.lastModified}`;

const fail = (message?: string) => new Error(message || "The resumable upload failed.");

async function putPart(url: string, body: Blob) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { method: "PUT", body });
      if (response.ok) return;
      lastError = new Error(`S3 rejected upload part (${response.status})`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 600 * 2 ** attempt));
  }
  throw lastError instanceof Error ? lastError : fail();
}

export async function uploadVideoResumably(file: File, options: UploadOptions) {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (![".mp4", ".mov", ".m4v", ".mxf"].includes(extension)) {
    throw fail("Use an MP4, MOV, M4V, or MXF source file.");
  }
  const gib = 1024 ** 3;
  const maxSize = options.mediaKind === "trailer" ? gib : options.target === "episode" ? 10 * gib : 25 * gib;
  if (file.size > maxSize) {
    throw fail(`${options.mediaKind === "trailer" ? "Trailer" : "Video"} must not exceed ${maxSize / gib} GB.`);
  }
  const storageKey = fingerprint(file, options);
  let sessionId = localStorage.getItem(storageKey);
  let status = null;

  if (sessionId) {
    const statusResponse = await getMultipartUploadStatus(sessionId);
    if (statusResponse.ok && statusResponse.data?.data.status === "active") {
      status = statusResponse.data.data;
    } else if (statusResponse.ok && statusResponse.data?.data.videoUploadId) {
      localStorage.removeItem(storageKey);
      return statusResponse.data.data.videoUploadId;
    } else if (statusResponse.ok && statusResponse.data?.data.status === "uploaded") {
      const completed = await completeMultipartUpload(sessionId);
      if (!completed.ok || !completed.data?.data.videoUploadId) throw fail(completed.data?.message);
      localStorage.removeItem(storageKey);
      return completed.data.data.videoUploadId;
    } else if (statusResponse.ok || statusResponse.status === 404 || statusResponse.status === 409) {
      localStorage.removeItem(storageKey);
      sessionId = null;
    } else {
      throw fail(statusResponse.data?.message || "Could not check the previous upload session.");
    }
  }

  if (!sessionId || !status) {
    const initiated = await initiateMultipartUpload({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
      mediaKind: options.mediaKind,
      target: options.target,
    });
    if (!initiated.ok || !initiated.data?.data) throw fail(initiated.data?.message);
    sessionId = initiated.data.data.sessionId;
    localStorage.setItem(storageKey, sessionId);
    const freshStatus = await getMultipartUploadStatus(sessionId);
    if (!freshStatus.ok || !freshStatus.data?.data) throw fail(freshStatus.data?.message);
    status = freshStatus.data.data;
  }

  const completed = new Map(status.uploadedParts.map((part) => [part.PartNumber, part.Size]));
  let uploadedBytes = Array.from(completed.values()).reduce((sum, size) => sum + size, 0);
  options.onProgress?.(Math.min(99, Math.round((uploadedBytes / file.size) * 100)));

  const missing = Array.from({ length: status.totalParts }, (_, index) => index + 1)
    .filter((partNumber) => !completed.has(partNumber));

  for (let offset = 0; offset < missing.length; offset += SIGNING_BATCH) {
    const batch = missing.slice(offset, offset + SIGNING_BATCH);
    const signed = await signMultipartUploadParts(sessionId, batch);
    if (!signed.ok || !signed.data?.data) throw fail(signed.data?.message);
    const queue = [...signed.data.data];

    const worker = async () => {
      while (queue.length) {
        const part = queue.shift();
        if (!part) return;
        const start = (part.partNumber - 1) * status!.partSize;
        const end = Math.min(start + status!.partSize, file.size);
        await putPart(part.url, file.slice(start, end));
        uploadedBytes += end - start;
        options.onProgress?.(Math.min(99, Math.round((uploadedBytes / file.size) * 100)));
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
  }

  const completedResponse = await completeMultipartUpload(sessionId);
  if (!completedResponse.ok || !completedResponse.data?.data.videoUploadId) {
    throw fail(completedResponse.data?.message);
  }
  localStorage.removeItem(storageKey);
  options.onProgress?.(100);
  return completedResponse.data.data.videoUploadId;
}
