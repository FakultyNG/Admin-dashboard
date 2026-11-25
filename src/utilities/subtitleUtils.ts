const MAX_SUBTITLE_BYTES = 5 * 1024 * 1024;

export type SubtitleTrack = {
  _id: string;
  language: string;
  src: string;
};

function decodeSubtitleText(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes);
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(bytes);
  }

  const utf8 = new TextDecoder("utf-8").decode(bytes);
  return utf8.includes("\uFFFD")
    ? new TextDecoder("windows-1252").decode(bytes)
    : utf8;
}

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
  if (!file.size) return "The subtitle file is empty.";
  if (file.size > MAX_SUBTITLE_BYTES) return "Subtitle files must be 5 MB or smaller.";

  const bytes = await file.arrayBuffer();
  const text = decodeSubtitleText(bytes);
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trim();
  if (!normalized || normalized.includes("\0")) {
    return "The selected file is empty or is not a plain-text subtitle.";
  }

  const timingPattern = /^\s*((?:\d{1,2}:)?\d{2}:\d{2}[.,]\d{1,3})\s*-->\s*((?:\d{1,2}:)?\d{2}:\d{2}[.,]\d{1,3})(?:\s+.*)?$/;
  const toMilliseconds = (value: string) => {
    const parts = value.replace(",", ".").split(":");
    const seconds = Number(parts.pop());
    const minutes = Number(parts.pop());
    const hours = Number(parts.pop() || 0);
    return ((hours * 60 + minutes) * 60 + seconds) * 1000;
  };
  const timingLines = normalized
    .split("\n")
    .map((line) => line.match(timingPattern))
    .filter((match): match is RegExpMatchArray => Boolean(match));

  if (!timingLines.length) {
    return "No valid subtitle cues were found. Upload a correctly formatted SRT or WebVTT file.";
  }
  if (timingLines.some((match) => toMilliseconds(match[2]) <= toMilliseconds(match[1]))) {
    return "A subtitle cue ends before it starts. Correct its timestamp and try again.";
  }
  return null;
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
        : "text/plain"),
    lastModified: file.lastModified,
  });
}
