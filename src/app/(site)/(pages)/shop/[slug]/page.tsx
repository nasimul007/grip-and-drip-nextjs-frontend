import { api } from "@/lib/api";
import type { ProductDetail } from "@/lib/types";
import { mapProductDetailForDisplay } from "@/lib/mappers";
import ShopDetails from "@/components/ShopDetails";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const product: ProductDetail = await api.get(`/api/products/${slug}/`);
    return {
      title: `${product.name} | NextCommerce`,
      description: product.description?.slice(0, 160),
    };
  } catch {
    return { title: "Product Not Found" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product: ProductDetail | null = null;
  try {
    product = await api.get(`/api/products/${slug}/`);
  } catch {
    /* product will be null → handled in ShopDetails */
  }

  const mapped = product ? mapProductDetailForDisplay(product) : null;

  return (
    <main>
      <ShopDetails apiProduct={mapped} />
    </main>
  );
}
