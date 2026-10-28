const KEY = "recently_viewed";
const MAX = 8;

export type ViewedProduct = {
  slug: string;
  title: string;
  price: number;
  discountedPrice: number;
  image: string;
};

function read(): ViewedProduct[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((p) => p && typeof p.slug === "string") : [];
  } catch {
    return [];
  }
}

/** Newest first, one entry per product, at most MAX. */
export function recordView(product: ViewedProduct): void {
  if (!product.slug) return;
  try {
    const rest = read().filter((p) => p.slug !== product.slug);
    localStorage.setItem(KEY, JSON.stringify([product, ...rest].slice(0, MAX)));
  } catch {}
}

export function getRecentlyViewed(excludeSlug?: string): ViewedProduct[] {
  return read().filter((p) => p.slug !== excludeSlug);
}
