import type { Metadata } from "next";
import { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { getCategoryTree, getProducts } from "@/lib/server-api";
import { buildApiQuery, hasFacetFilters, parseFilters } from "@/lib/shop-query";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filters = parseFilters(await searchParams);
  const title = filters.q
    ? `Search results for "${filters.q}"`
    : filters.page > 1
      ? `Shop gadgets & accessories – page ${filters.page}`
      : "Shop gadgets & accessories";
  return {
    title,
    description:
      "Browse chargers, earbuds, headphones, smartwatches, speakers, cables and mobile accessories. Compare prices and order online with cash on delivery in Bangladesh.",
    alternates: {
      canonical: filters.page > 1 ? `/shop?page=${filters.page}` : "/shop",
    },
    // Filtered/sorted/search variants are useful for shoppers, not for the index.
    robots: hasFacetFilters(filters) ? { index: false, follow: true } : undefined,
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const [categories, initial] = await Promise.all([
    getCategoryTree(),
    getProducts(buildApiQuery(filters)),
  ]);

  return (
    <main>
      <Breadcrumb
        title={filters.q ? `Search: ${filters.q}` : "All products"}
        items={[{ name: "Shop", href: filters.q ? "/shop" : undefined }, ...(filters.q ? [{ name: "Search" }] : [])]}
      />
      <Suspense>
        <ShopWithSidebar
          categories={categories}
          initialData={initial ? { results: initial.results, count: initial.count } : null}
        />
      </Suspense>
    </main>
  );
}
