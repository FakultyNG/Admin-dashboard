"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

interface SafeImageProps extends Omit<ImageProps, "src" | "onError"> {
  src?: string | null;
  fallbackSrc?: string;
}

function isSupportedSource(src?: string | null): src is string {
  return Boolean(src && (src.startsWith("/") || src.startsWith("https://")));
}

export default function SafeImage({
  src,
  fallbackSrc = "/user.png",
  alt,
  ...props
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolvedSrc =
    isSupportedSource(src) && failedSrc !== src ? src : fallbackSrc;

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      onError={() => {
        if (resolvedSrc !== fallbackSrc) setFailedSrc(resolvedSrc);
      }}
    />
  );
}
