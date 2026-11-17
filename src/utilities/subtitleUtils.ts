const MAX_SUBTITLE_BYTES = 5 * 1024 * 1024;
const TIMING_LINE = /^(?:\d{1,2}:)?\d{2}:\d{2}[,.]\d{3}\s*-->\s*(?:\d{1,2}:)?\d{2}:\d{2}[,.]\d{3}(?:\s+.*)?$/;

export type SubtitleTrack = {
  _id: string;
  language: string;
  src: string;
};

export function normalizeSubtitleTracks(value: unknown): SubtitleTrack[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const track = item as Record<string, unknown>;
    if (typeof track._id !== "string" || typeof track.language !== "string") {
      return [];
    }

    return [{
      _id: track._id,
      language: track.language,
      src: typeof track.src === "string" ? track.src : "",
    }];
  });
}

export async function validateSubtitleFile(file: File): Promise<string | null> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["srt", "vtt"].includes(extension)) {
    return "Choose a subtitle file ending in .srt or .vtt.";
  }
  if (!file.size) return "The subtitle file is empty.";
  if (file.size > MAX_SUBTITLE_BYTES) return "Subtitle files must be 5 MB or smaller.";

  let text: string;
  try {
    const bytes = await file.arrayBuffer();
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return "Subtitle files must be plain text encoded as UTF-8.";
  }

  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trim();
  if (!normalized || normalized.includes("\0")) {
    return "The selected file is empty or is not a plain-text subtitle.";
  }

  const blocks = normalized.replace(/^WEBVTT[^\n]*\n?/i, "").split(/\n{2,}/);
  const hasCue = blocks.some((block) => {
    const lines = block.split("\n").map((line) => line.trim());
    const timingIndex = lines.findIndex((line) => TIMING_LINE.test(line));
    return timingIndex >= 0 && lines.slice(timingIndex + 1).some(Boolean);
  });

  return hasCue
    ? null
    : "No valid captions were found. Check that every cue has a start time, end time, and caption text.";
}

/**
 * Keep a subtitle independent from the browser's temporary file-input handle.
 * Some browsers invalidate that handle after the picker is reset or after a
 * long episode upload, which produces a multipart request with no file part.
 */
export async function preserveSubtitleFile(file: File): Promise<File> {
  const bytes = await file.arrayBuffer();
  return new File([bytes], file.name, {
    type:
      file.type ||
      (file.name.toLowerCase().endsWith(".vtt")
        ? "text/vtt"
        : "application/x-subrip"),
    lastModified: file.lastModified,
  });
}
