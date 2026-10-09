import Link from "next/link";
import ProductItem from "@/components/Common/ProductItem";
import { getDeals } from "@/lib/deals";
import { mapProductForDisplay } from "@/lib/mappers";

/** Discounted products, biggest discount first. Hidden when there are none. */
const HotDeals = async () => {
  const deals = await getDeals(8);
  if (deals.length === 0) return null;

  return (
    <section className="overflow-hidden pt-12 bg-brand-dark" aria-labelledby="hot-deals-heading">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="block text-custom-sm font-medium text-brand-accent mb-1">Biggest discounts</span>
            <h2 id="hot-deals-heading" className="font-semibold text-xl xl:text-heading-5 text-white">
              Hot deals
            </h2>
          </div>
          <Link
            href="/deals"
            className="inline-flex font-medium text-custom-sm py-2.5 px-7 rounded-md border border-brand-border bg-brand-card text-white ease-out duration-200 hover:bg-brand-accent hover:text-brand-dark hover:border-brand-accent"
          >
            View all deals
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {deals.map((p, i) => (
            <ProductItem item={mapProductForDisplay(p)} key={p.id} priority={false} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotDeals;
