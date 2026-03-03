"use client";

import Image, { type ImageProps } from "next/image";

/**
 * Wrapper around next/image that uses unoptimized for /uploads/ paths.
 * Fixes "The requested resource isn't a valid image... received null" in production
 * for user-uploaded images that may have format quirks or deployment path differences.
 */
export function SafeImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const isUpload = src.startsWith("/uploads/");
  return <Image {...props} unoptimized={isUpload} />;
}
