import type { MetadataRoute } from "next";
import { SITE_URL, mediaUrl } from "@/lib/site";
import { POLICIES } from "@/lib/policies";
import { getAllBrands, brandSlug } from "@/lib/brands";
import { getCategoryTree, serverGet, type CategoryNode } from "@/lib/server-api";
import type { PaginatedResponse, ProductListItem } from "@/lib/types";

export const revalidate = 3600;

async function allProducts(): Promise<ProductListItem[]> {
  const out: ProductListItem[] = [];
  for (let page = 1; page <= 100; page++) {
    const data = await serverGet<PaginatedResponse<ProductListItem>>(
      `/api/products/?page=${page}&page_size=100&ordering=-created_at`,
      3600
    );
    if (!data) break;
    out.push(...data.results);
    if (!data.next) break;
  }
  return out;
}

function flatten(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children || [])]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, tree, brands] = await Promise.all([allProducts(), getCategoryTree(), getAllBrands()]);
  const now = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/deals`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    ...POLICIES.map((p) => ({
      url: `${SITE_URL}/${p.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
    ...flatten(tree).map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...brands.map((b) => ({
      url: `${SITE_URL}/brand/${brandSlug(b.name)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => {
      const image = mediaUrl(p.primary_image?.image);
      return {
        url: `${SITE_URL}/shop/${p.slug}`,
        lastModified: new Date(p.updated_at || p.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        ...(image && { images: [image] }),
      };
    }),
  ];
}
