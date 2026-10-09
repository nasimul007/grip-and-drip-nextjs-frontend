import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopDetails from "@/components/ShopDetails";
import Breadcrumb, { type BreadcrumbItem } from "@/components/Common/Breadcrumb";
import ProductGrid from "@/components/Common/ProductGrid";
import JsonLd from "@/components/Common/JsonLd";
import { getProduct, getRelatedProducts, serverGet } from "@/lib/server-api";
import { mapProductDetailForDisplay, mapProductForDisplay } from "@/lib/mappers";
import { SITE_NAME, absoluteUrl, mediaUrl, stripHtml, truncate } from "@/lib/site";
import type { PaginatedResponse, ProductDetail, ProductListItem, ShippingRate } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

function productImages(product: ProductDetail): string[] {
  const sorted = [...product.images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order
  );
  return sorted.map((img) => mediaUrl(img.image)).filter(Boolean) as string[];
}

function describe(product: ProductDetail): string {
  if (product.meta_description) return product.meta_description;
  const text = stripHtml(product.description);
  if (text) return truncate(text);
  return truncate(
    `Buy ${product.name}${product.brand ? ` by ${product.brand}` : ""} online in Bangladesh at the best price. Cash on delivery available.`
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };

  // A CMS meta title is used verbatim; otherwise the layout template appends the brand.
  const title = product.meta_title ? { absolute: product.meta_title } : product.name;
  const socialTitle = product.meta_title || product.name;
  const description = describe(product);
  const image = mediaUrl(product.og_image) || productImages(product)[0];
  const url = `/shop/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: socialTitle,
      description,
      siteName: SITE_NAME,
      ...(image && { images: [{ url: image, alt: product.name }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [related, rates] = await Promise.all([
    getRelatedProducts(slug),
    serverGet<PaginatedResponse<ShippingRate> | ShippingRate[]>("/api/shipping-rates/", 600),
  ]);
  const shippingRates = rates ? (Array.isArray(rates) ? rates : rates.results) : [];

  const url = absoluteUrl(`/shop/${product.slug}`);
  const images = productImages(product);
  const variants = (product.variants || []).filter((v) => v.is_active);
  const prices = variants.length
    ? variants.map((v) => Number(v.price_override ?? product.effective_price))
    : [Number(product.effective_price)];
  const inStock = variants.length
    ? variants.some((v) => v.stock > 0)
    : product.stock > 0;

  const offerBase = {
    priceCurrency: "BDT",
    availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    url,
    seller: { "@id": absoluteUrl("/#organization") },
  };
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: truncate(stripHtml(product.description) || describe(product), 5000),
    sku: product.sku,
    ...(images.length && { image: images }),
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
    ...(product.category_name && { category: product.category_name }),
    offers:
      Math.min(...prices) === Math.max(...prices)
        ? { "@type": "Offer", price: prices[0].toFixed(2), ...offerBase }
        : {
            "@type": "AggregateOffer",
            lowPrice: Math.min(...prices).toFixed(2),
            highPrice: Math.max(...prices).toFixed(2),
            offerCount: prices.length,
            ...offerBase,
          },
  };

  const crumbs: BreadcrumbItem[] = [
    { name: "Shop", href: "/shop" },
    ...(product.breadcrumb || []).map((c) => ({ name: c.name, href: `/category/${c.slug}` })),
    { name: product.name },
  ];

  const display = {
    ...mapProductDetailForDisplay(product),
    categoryName: product.category_name,
    categorySlug: product.category_slug,
  };

  return (
    <main>
      <JsonLd data={productSchema} />
      <Breadcrumb items={crumbs} />
      <ShopDetails product={display} shippingRates={shippingRates} />
      <ProductGrid
        title="You may also like"
        products={related.map((p) => mapProductForDisplay(p as ProductListItem))}
      />
    </main>
  );
}
