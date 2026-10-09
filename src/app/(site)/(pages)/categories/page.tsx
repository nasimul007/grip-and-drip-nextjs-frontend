import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { getCategoryTree } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "All categories",
  description:
    "Browse every gadget and accessory category: chargers, cables, earbuds, headphones, smartwatches, covers, screen protectors and more.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const tree = await getCategoryTree();

  return (
    <main>
      <Breadcrumb title="All categories" items={[{ name: "Categories" }]} />
      <section className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-8 lg:py-12">
        {tree.length === 0 ? (
          <p>
            No categories yet. <Link href="/shop" className="text-brand-accent">Browse all products</Link>
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tree.map((cat) => (
              <div key={cat.id} className="rounded-lg border border-brand-border bg-brand-card p-5">
                <h2 className="text-lg font-semibold text-white mb-3">
                  <Link href={`/category/${cat.slug}`} className="hover:text-brand-accent">
                    {cat.name}
                  </Link>
                </h2>
                {cat.children && cat.children.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {cat.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/category/${child.slug}`}
                          className="inline-block rounded-full border border-brand-border px-3 py-1 text-custom-sm text-white hover:border-brand-accent hover:text-brand-accent"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
