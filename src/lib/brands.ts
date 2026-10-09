import { getRecentProducts } from "./server-api";

export type BrandCount = { name: string; count: number };

/** Most common brands among the newest ~300 products. */
export async function getTopBrands(limit = 8): Promise<BrandCount[]> {
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
