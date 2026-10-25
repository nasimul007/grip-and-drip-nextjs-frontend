/** Serve backend media through the same-origin /media rewrite instead of its absolute URL. */
export function mediaPath(src: string): string {
  if (!/^https?:\/\//i.test(src)) return src;
  try {
    const { pathname } = new URL(src);
    return pathname.startsWith("/media/") ? pathname : src;
  } catch {
    return src;
  }
}

type Imgs = { thumbnails: string[]; previews: string[] } | undefined;

/** Cart images for a line: the chosen variant's photo first, then the product's. */
export function cartImgs(imgs: Imgs, variantImage?: string | null) {
  const own = (imgs?.thumbnails || []).filter(Boolean);
  const list = variantImage ? [variantImage, ...own.filter((s) => s !== variantImage)] : own;
  return { thumbnails: list, previews: list };
}
