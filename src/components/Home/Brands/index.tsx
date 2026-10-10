import { getTopBrands } from "@/lib/brands";
import BrandCarousel from "./BrandCarousel";

/** Shop-by-brand strip; only shown when the catalogue has at least two brands. */
const Brands = async () => {
  const brands = await getTopBrands(12);
  if (brands.length < 2) return null;

  return (
    <section className="overflow-hidden pt-10 bg-brand-dark" aria-labelledby="brands-heading">
      <BrandCarousel brands={brands} />
    </section>
  );
};

export default Brands;
