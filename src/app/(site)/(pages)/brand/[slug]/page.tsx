import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import Breadcrumb from "@/components/Common/Breadcrumb";
import JsonLd from "@/components/Common/JsonLd";
import { findBrandBySlug, brandSlug } from "@/lib/brands";
import { getCategoryTree, getFilterFacets, getProducts } from "@/lib/server-api";
import { PAGE_SIZE, buildApiQuery, buildFacetQuery, hasFacetFilters, parseFilters } from "@/lib/shop-query";
import { SITE_NAME, absoluteUrl, truncate } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function intro(name: string, count: number, description?: string): string {
  if (description?.trim()) return description.trim();
  return `Buy original ${name} products in Bangladesh at ${SITE_NAME}. Browse ${count} ${name} ${
    count === 1 ? "product" : "products"
  } with genuine quality, warranty where applicable, cash on delivery and fast delivery across Bangladesh.`;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const brand = await findBrandBySlug(slug);
  if (!brand) return { title: "Brand not found", robots: { index: false } };
  // Brand is fixed by the URL; any other filter makes the page a non-indexed variant.
  const filters = { ...parseFilters(sp), brand: "" };
  const path = `/brand/${slug}`;
  const pageSuffix = filters.page > 1 ? ` – page ${filters.page}` : "";
  const title = `${brand.name} Price in Bangladesh – Original ${brand.name} Products${pageSuffix}`;
  const description = truncate(intro(brand.name, brand.count, brand.description));

  return {
    title,
    description,
    alternates: { canonical: filters.page > 1 ? `${path}?page=${filters.page}` : path },
    openGraph: { url: path, title, description },
    robots: hasFacetFilters(filters) ? { index: false, follow: true } : undefined,
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const brand = await findBrandBySlug(slug);
  if (!brand) notFound();

  const filters = { ...parseFilters(sp), brand: brand.name };
  const [categories, initial, facets] = await Promise.all([
    getCategoryTree(),
    getProducts(buildApiQuery(filters)),
    getFilterFacets(buildFacetQuery(filters)),
  ]);
  const text = intro(brand.name, brand.count, brand.description);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${brand.name} products`,
    url: absoluteUrl(`/brand/${brandSlug(brand.name)}`),
    description: truncate(text, 300),
    about: { "@type": "Brand", name: brand.name, ...(brand.logo && { logo: brand.logo }) },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: initial?.count ?? 0,
      itemListElement: (initial?.results || []).map((p, i) => ({
        "@type": "ListItem",
        position: (filters.page - 1) * PAGE_SIZE + i + 1,
        url: absoluteUrl(`/shop/${p.slug}`),
        name: p.name,
      })),
    },
  };

  return (
    <main>
      <JsonLd data={schema} />
      <Breadcrumb
        title={`${brand.name} products`}
        items={[{ name: "Shop", href: "/shop" }, { name: brand.name }]}
      />
      {filters.page === 1 && (
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pt-7.5">
          <p className="max-w-[870px] xl:ml-auto text-custom-sm">{text}</p>
        </div>
      )}
      <Suspense>
        <ShopWithSidebar
          categories={categories}
          facets={facets}
          lockedBrand={brand.name}
          initialData={initial ? { results: initial.results, count: initial.count } : null}
        />
      </Suspense>
    </main>
  );
}
