import { getRecentProducts } from "./server-api";
import type { ProductListItem } from "./types";

export const discountOf = (p: ProductListItem): number => {
  const list = Number(p.compare_price);
  const sale = Number(p.effective_price);
  return list > sale && sale > 0 ? Math.round(((list - sale) / list) * 100) : 0;
};

/**
 * Discounted in-stock products, biggest discount first. Looks at the newest
 * ~300 products only (the API has no "on sale" filter).
 */
export async function getDeals(limit: number): Promise<ProductListItem[]> {
  const products = await getRecentProducts();
  return products
    .filter((p) => p.is_active && p.stock > 0 && discountOf(p) > 0)
    .sort((a, b) => discountOf(b) - discountOf(a))
    .slice(0, limit);
}
