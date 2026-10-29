import { getFilterFacets, getRecentProducts } from "./server-api";
import { brandSlug } from "./brand-slug";

export { brandSlug };

export type BrandCount = { name: string; count: number; logo?: string | null; description?: string };

/** Every brand in the catalogue (most products first). */
export async function getAllBrands(): Promise<BrandCount[]> {
  return getTopBrands(500);
}

export async function findBrandBySlug(slug: string): Promise<BrandCount | null> {
  const brands = await getAllBrands();
  return brands.find((b) => brandSlug(b.name) === slug) ?? null;
}

/** Most common brands in the whole catalogue. */
export async function getTopBrands(limit = 8): Promise<BrandCount[]> {
  const facets = await getFilterFacets("in_stock=true");
  if (facets && Array.isArray(facets.brands)) return facets.brands.slice(0, limit);

  // Older backend: count brands among the newest ~300 products.
  const counts = new Map<string, number>();
  for (const p of await getRecentProducts()) {
    const name = (p.brand || "").trim();
    if (name) counts.set(name, (counts.get(name) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}
