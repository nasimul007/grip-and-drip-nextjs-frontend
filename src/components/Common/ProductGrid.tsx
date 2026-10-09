import ProductItem from "./ProductItem";
import type { Product } from "@/types/product";

type Props = {
  title: string;
  products: Product[];
  className?: string;
};

/** Simple server-renderable product section (items are client components). */
export default function ProductGrid({ title, products, className = "" }: Props) {
  if (!products.length) return null;
  return (
    <section className={`overflow-hidden py-15 ${className}`}>
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <h2 className="font-semibold text-xl xl:text-heading-5 text-white mb-7.5">{title}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-7.5">
          {products.map((item) => (
            <ProductItem item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
