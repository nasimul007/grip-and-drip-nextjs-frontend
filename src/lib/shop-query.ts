// Shared between the server pages and the client listing so both build the same API query.

export const PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { label: "Latest", value: "-created_at" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
  { label: "Name: A-Z", value: "name" },
  { label: "Name: Z-A", value: "-name" },
  { label: "Featured", value: "-is_featured" },
];
const SORT_VALUES = new Set(SORT_OPTIONS.map((o) => o.value));
export const DEFAULT_SORT = "-created_at";

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function getAll(src: ParamSource, key: string): string[] {
  if (src instanceof URLSearchParams) return src.getAll(key);
  const v = src[key];
  return v === undefined ? [] : Array.isArray(v) ? v : [v];
}
const get = (src: ParamSource, key: string) => getAll(src, key)[0] ?? "";

export type ShopFilters = {
  page: number;
  sort: string;
  q: string;
  brand: string;
  min: number;
  max: number;
  categories: string[];
};

export function parseFilters(src: ParamSource): ShopFilters {
  const page = Math.max(1, parseInt(get(src, "page"), 10) || 1);
  const sort = SORT_VALUES.has(get(src, "sort")) ? get(src, "sort") : DEFAULT_SORT;
  const num = (k: string) => Math.max(0, parseInt(get(src, k), 10) || 0);
  return {
    page,
    sort,
    q: get(src, "q").trim(),
    brand: get(src, "brand"),
    min: num("min"),
    max: num("max"),
    categories: getAll(src, "category").filter((c) => /^\d+$/.test(c)),
  };
}

/** Query string for GET /api/products/. */
export function buildApiQuery(f: ShopFilters, lockedCategoryId?: number): string {
  const p = new URLSearchParams();
  p.set("page", String(f.page));
  p.set("page_size", String(PAGE_SIZE));
  p.set("ordering", f.sort);
  const cats = lockedCategoryId ? [String(lockedCategoryId)] : f.categories;
  cats.forEach((id) => p.append("category", id));
  if (f.min > 0) p.set("price__gte", String(f.min));
  if (f.max > 0) p.set("price__lte", String(f.max));
  if (f.brand) p.set("brand", f.brand);
  if (f.q) p.set("search", f.q);
  return p.toString();
}

/** True when the URL carries anything beyond plain pagination (used for noindex). */
export function hasFacetFilters(f: ShopFilters): boolean {
  return Boolean(
    f.q || f.brand || f.min || f.max || f.categories.length || f.sort !== DEFAULT_SORT
  );
}
