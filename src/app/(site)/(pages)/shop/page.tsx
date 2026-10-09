import type { Metadata } from "next";
import { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { getCategoryTree, getFilterFacets, getProducts } from "@/lib/server-api";
import { buildApiQuery, buildFacetQuery, hasFacetFilters, parseFilters } from "@/lib/shop-query";

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
  const [categories, initial, facets] = await Promise.all([
    getCategoryTree(),
    getProducts(buildApiQuery(filters)),
    getFilterFacets(buildFacetQuery(filters)),
  ]);

  return (
    <main>
      <Breadcrumb
        title={filters.q ? `Search: ${filters.q}` : "All products"}
        items={[{ name: "Shop", href: filters.q ? "/shop" : undefined }, ...(filters.q ? [{ name: "Search" }] : [])]}
      />
      {!hasFacetFilters(filters) && filters.page === 1 && (
        <p className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pt-3 text-custom-sm">
          Shop original chargers, earbuds, headphones, smartwatches, cables and mobile accessories.
          Filter by brand, price and availability, pay with cash on delivery or bKash, and get delivery across Bangladesh.
        </p>
      )}
      <Suspense>
        <ShopWithSidebar
          categories={categories}
          facets={facets}
          initialData={initial ? { results: initial.results, count: initial.count } : null}
        />
      </Suspense>
    </main>
  );
}
