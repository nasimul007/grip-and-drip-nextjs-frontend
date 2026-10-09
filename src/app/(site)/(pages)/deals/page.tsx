import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import JsonLd from "@/components/Common/JsonLd";
import ProductGrid from "@/components/Common/ProductGrid";
import { getDeals } from "@/lib/deals";
import { mapProductForDisplay } from "@/lib/mappers";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hot deals on gadgets & accessories",
  description:
    "Discounted chargers, earbuds, smartwatches and mobile accessories, sorted by biggest discount. Cash on delivery across Bangladesh.",
  alternates: { canonical: "/deals" },
};

export default async function DealsPage() {
  const deals = await getDeals(48);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Hot deals",
    url: absoluteUrl("/deals"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: deals.length,
      itemListElement: deals.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/shop/${p.slug}`),
        name: p.name,
      })),
    },
  };

  return (
    <main>
      <JsonLd data={schema} />
      <Breadcrumb title="Hot deals" items={[{ name: "Deals" }]} />
      {deals.length > 0 ? (
        <ProductGrid title="Biggest discounts first" products={deals.map(mapProductForDisplay)} />
      ) : (
        <section className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-16 text-center">
          <p className="text-white mb-3">There are no deals right now.</p>
          <Link href="/shop" className="text-brand-accent hover:underline">
            Browse all products
          </Link>
        </section>
      )}
    </main>
  );
}
