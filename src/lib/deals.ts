import { getProducts, getRecentProducts } from "./server-api";
import type { ProductListItem } from "./types";

export const discountOf = (p: ProductListItem): number => {
  const list = Number(p.compare_price);
  const sale = Number(p.effective_price);
  return list > sale && sale > 0 ? Math.round(((list - sale) / list) * 100) : 0;
};

/** Discounted in-stock products, biggest discount first. */
export async function getDeals(limit: number): Promise<ProductListItem[]> {
  // Backend filter (all products). Older backends ignore the unknown params and
  // return plain listings, so verify every item is really discounted.
  const data = await getProducts(
    `on_sale=true&in_stock=true&ordering=-discount_pct&page_size=${Math.min(limit, 100)}`
  );
  if (data && data.results.length > 0 && data.results.every((p) => discountOf(p) > 0)) {
    return data.results.slice(0, limit);
  }
  // Fallback: derive from the newest ~300 products.
  const products = await getRecentProducts();
  return products
    .filter((p) => p.is_active && (p.total_stock ?? p.stock) > 0 && discountOf(p) > 0)
    .sort((a, b) => discountOf(b) - discountOf(a))
    .slice(0, limit);
}
