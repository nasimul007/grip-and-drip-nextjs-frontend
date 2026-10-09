import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import Breadcrumb from "@/components/Common/Breadcrumb";
import JsonLd from "@/components/Common/JsonLd";
import { getCategory, getProducts } from "@/lib/server-api";
import { PAGE_SIZE, buildApiQuery, hasFacetFilters, parseFilters } from "@/lib/shop-query";
import { absoluteUrl, mediaUrl, stripHtml, truncate } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) return { title: "Category not found", robots: { index: false } };
  const filters = parseFilters(sp);

  const pageSuffix = filters.page > 1 ? ` – page ${filters.page}` : "";
  const socialTitle = category.meta_title || `${category.name} price in Bangladesh`;
  // A CMS meta title is used verbatim; otherwise the layout template appends the brand.
  const title = category.meta_title
    ? { absolute: `${category.meta_title}${pageSuffix}` }
    : `${socialTitle}${pageSuffix}`;
  const description =
    category.meta_description ||
    truncate(stripHtml(category.description)) ||
    truncate(
      `Buy ${category.name.toLowerCase()} online in Bangladesh. ${category.product_count} products with genuine quality, best prices and cash on delivery.`
    );
  const path = `/category/${category.slug}`;
  const image = mediaUrl(category.og_image);

  return {
    title,
    description,
    alternates: { canonical: filters.page > 1 ? `${path}?page=${filters.page}` : path },
    openGraph: { url: path, title: socialTitle, description, ...(image && { images: [image] }) },
    robots: hasFacetFilters(filters) ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) notFound();

  const filters = parseFilters(sp);
  const initial = await getProducts(buildApiQuery(filters, category.id));
  const intro = stripHtml(category.description);

  const crumbs = [
    { name: "Shop", href: "/shop" },
    ...category.breadcrumb.map((c, i, arr) => ({
      name: c.name,
      href: i < arr.length - 1 ? `/category/${c.slug}` : undefined,
    })),
  ];

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    url: absoluteUrl(`/category/${category.slug}`),
    ...(intro && { description: truncate(intro, 300) }),
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
      <JsonLd data={collectionSchema} />
      <Breadcrumb title={category.name} items={crumbs} />
      {category.description && filters.page === 1 && (
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pt-7.5">
          <div
            className="product-description max-w-[870px] xl:ml-auto text-custom-sm"
            dangerouslySetInnerHTML={{ __html: category.description }}
          />
        </div>
      )}
      <Suspense>
        <ShopWithSidebar
          categories={category.subcategories}
          lockedCategoryId={category.id}
          initialData={initial ? { results: initial.results, count: initial.count } : null}
        />
      </Suspense>
    </main>
  );
}
