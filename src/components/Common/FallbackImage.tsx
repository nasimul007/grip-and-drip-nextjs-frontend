"use client";
import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "onError" | "unoptimized"> & {
  /** Text shown when the image cannot be loaded at all. */
  fallbackLabel?: string;
};

/**
 * next/image that survives a failed optimiser response: it first retries the
 * file directly (bypassing /_next/image), and shows a placeholder only if that
 * fails too, so a slide is never left as a broken or blank image.
 */
export default function FallbackImage({ src, alt, fallbackLabel = "Image unavailable", ...rest }: Props) {
  const [stage, setStage] = useState<"optimized" | "direct" | "failed">("optimized");

  // A different image gets a fresh attempt.
  useEffect(() => setStage("optimized"), [src]);

  if (stage === "failed") {
    return (
      <span
        role="img"
        aria-label={alt}
        className="absolute inset-0 flex items-center justify-center text-center text-custom-sm text-brand-muted"
      >
        {fallbackLabel}
      </span>
    );
  }

  return (
    <Image
      {...rest}
      src={src}
      alt={alt}
      unoptimized={stage === "direct"}
      onError={() => setStage((s) => (s === "optimized" ? "direct" : "failed"))}
    />
  );
}
