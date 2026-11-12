"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { MAIN_API_BASE_URL } from "@/config/api";

interface SafeImageProps extends Omit<ImageProps, "src" | "onError"> {
  src?: unknown;
  fallbackSrc?: string;
}

function getObjectSource(value: Record<string, unknown>): unknown {
  for (const key of ["url", "URL", "Location", "location", "secure_url", "src"]) {
    if (value[key]) return value[key];
  }

  if (typeof value.Bucket === "string" && typeof value.Key === "string") {
    const encodedKey = value.Key.split("/").map(encodeURIComponent).join("/");
    return `https://${value.Bucket}.s3.amazonaws.com/${encodedKey}`;
  }

  return null;
}

export function normalizeImageSource(value: unknown): string | null {
  if (value && typeof value === "object") {
    return normalizeImageSource(getObjectSource(value as Record<string, unknown>));
  }
  if (typeof value !== "string") return null;

  let source = value.trim().replace(/\\/g, "/");
  if (!source) return null;

  if ((source.startsWith('"') && source.endsWith('"')) || source.startsWith("{")) {
    try {
      return normalizeImageSource(JSON.parse(source));
    } catch {
      source = source.replace(/^['"]|['"]$/g, "");
    }
  }

  if (source.startsWith("//")) return `https:${source}`;
  if (/^(https?:|blob:|data:)/i.test(source)) return source;
  if (source.startsWith("/")) return source;
  if (/^[\w.-]+\.[a-z]{2,}(?:\/|$)/i.test(source)) return `https://${source}`;

  try {
    const apiOrigin = new URL(MAIN_API_BASE_URL).origin;
    return new URL(source.replace(/^\.\//, ""), `${apiOrigin}/`).toString();
  } catch {
    return null;
  }
}

export default function SafeImage({
  src,
  fallbackSrc = "/user.png",
  alt,
  ...props
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const normalizedSrc = normalizeImageSource(src);
  const resolvedSrc = normalizedSrc && failedSrc !== normalizedSrc
    ? normalizedSrc
    : fallbackSrc;

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      unoptimized={props.unoptimized ?? true}
      onError={() => {
        if (resolvedSrc !== fallbackSrc) setFailedSrc(resolvedSrc);
      }}
    />
  );
}
