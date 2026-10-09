import Link from "next/link";
import { getTopBrands } from "@/lib/brands";

/** Shop-by-brand strip; only shown when the catalogue has at least two brands. */
const Brands = async () => {
  const brands = await getTopBrands(8);
  if (brands.length < 2) return null;

  return (
    <section className="overflow-hidden pt-10 bg-brand-dark" aria-labelledby="brands-heading">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <h2 id="brands-heading" className="font-semibold text-xl xl:text-heading-5 text-white mb-5">
          Shop by brand
        </h2>
        <ul className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {brands.map((b) => (
            <li key={b.name} className="shrink-0">
              <Link
                href={`/shop?brand=${encodeURIComponent(b.name)}`}
                className="flex min-w-[130px] flex-col items-center rounded-lg border border-brand-border bg-brand-card px-5 py-3 text-center ease-out duration-200 hover:border-brand-accent"
              >
                <span className="font-semibold text-white">{b.name}</span>
                <span className="text-custom-xs text-brand-muted">
                  {b.count} {b.count === 1 ? "product" : "products"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Brands;
