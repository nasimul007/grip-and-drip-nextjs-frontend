import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import ShopDetails from "@/components/ShopDetails";
import { brandSlug } from "@/lib/brand-slug";
import Breadcrumb, { type BreadcrumbItem } from "@/components/Common/Breadcrumb";
import ProductGrid from "@/components/Common/ProductGrid";
import JsonLd from "@/components/Common/JsonLd";
import { getProduct, getRelatedProducts, serverGet } from "@/lib/server-api";
import { mapProductDetailForDisplay, mapProductForDisplay } from "@/lib/mappers";
import { SITE_NAME, absoluteUrl, mediaUrl, stripHtml, truncate } from "@/lib/site";
import type { PaginatedResponse, ProductDetail, ProductListItem, ShippingRate } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

/** Loads a product; a renamed product's old URL redirects (301) to its current slug. */
async function loadProduct(slug: string) {
  const product = await getProduct(slug);
  if (product) return product;
  const moved = await serverGet<{ slug: string }>(`/api/products/redirect/${encodeURIComponent(slug)}/`, 300);
  if (moved?.slug && moved.slug !== slug) permanentRedirect(`/shop/${moved.slug}`);
  return null;
}

function productImages(product: ProductDetail): string[] {
  const sorted = [...product.images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order
  );
  const own = sorted.map((img) => mediaUrl(img.image)).filter(Boolean) as string[];
  if (own.length) return own;
  // No product images: use the variants' images (in-stock first).
  const fromVariants = [...(product.variants || [])]
    .filter((v) => v.is_active !== false && v.image)
    .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || a.sort_order - b.sort_order)
    .map((v) => mediaUrl(v.image))
    .filter(Boolean) as string[];
  return Array.from(new Set(fromVariants));
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
  const product = await loadProduct(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };

  // A CMS meta title is used verbatim; otherwise the layout template appends the brand.
  const fallbackTitle = `${product.name} Price in Bangladesh`;
  const title = product.meta_title ? { absolute: product.meta_title } : fallbackTitle;
  const socialTitle = product.meta_title || fallbackTitle;
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
  const product = await loadProduct(slug);
  if (!product) notFound();

  const [related, rates] = await Promise.all([
    getRelatedProducts(slug),
    serverGet<PaginatedResponse<ShippingRate> | ShippingRate[]>("/api/shipping-rates/", 600),
  ]);
  const shippingRates = rates ? (Array.isArray(rates) ? rates : rates.results) : [];

  const url = absoluteUrl(`/shop/${product.slug}`);
  const images = productImages(product);
  const variants = (product.variants || []).filter((v) => v.is_active);
  const priceOf = (v?: { price_override: number | null }) =>
    Number(v?.price_override ?? product.effective_price);
  const prices = variants.length ? variants.map(priceOf) : [priceOf()];
  const inStock = variants.length
    ? variants.some((v) => v.stock > 0)
    : product.stock > 0;
  const validUntil = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  const warrantyPromise = product.warranty_months
    ? {
        warranty: {
          "@type": "WarrantyPromise",
          durationOfWarranty: { "@type": "QuantitativeValue", value: product.warranty_months, unitCode: "MON" },
          warrantyScope: "https://schema.org/RepairAndReplace",
        },
      }
    : {};

  const offerCommon = {
    priceCurrency: "BDT",
    itemCondition: "https://schema.org/NewCondition",
    url,
    priceValidUntil: validUntil,
    seller: { "@id": absoluteUrl("/#organization") },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "BD",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 7,
      merchantReturnLink: absoluteUrl("/return-policy"),
    },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "BD" },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
        transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 4, unitCode: "DAY" },
      },
    },
    ...warrantyPromise,
  };
  const availability = (ok: boolean) =>
    ok ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

  const common = {
    "@context": "https://schema.org",
    "@id": `${url}#product`,
    name: product.name,
    description: truncate(stripHtml(product.description) || describe(product), 5000),
    ...(images.length && { image: images }),
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
    ...(product.category_name && { category: product.category_name }),
    ...(product.review_count && product.rating_average != null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: String(product.rating_average),
        reviewCount: String(product.review_count),
        bestRating: "5",
      },
    }),
  };

  const attrKeys = Array.from(new Set(variants.flatMap((v) => Object.keys(v.attributes || {}))));
  const variesBy = attrKeys
    .map((k) =>
      /colou?r/i.test(k) ? "https://schema.org/color" : /size|length|capacity/i.test(k) ? "https://schema.org/size" : null
    )
    .filter(Boolean);

  const productSchema =
    variants.length > 1
      ? {
          ...common,
          "@type": "ProductGroup",
          productGroupID: product.sku,
          ...(variesBy.length && { variesBy }),
          hasVariant: variants.map((v) => {
            const attrs = v.attributes || {};
            const colorKey = attrKeys.find((k) => /colou?r/i.test(k));
            const sizeKey = attrKeys.find((k) => /size|length|capacity/i.test(k));
            const vImage = mediaUrl(v.image);
            return {
              "@type": "Product",
              sku: v.sku,
              name: `${product.name} – ${v.name}`,
              ...(vImage ? { image: [vImage] } : images.length ? { image: images } : {}),
              ...(colorKey && attrs[colorKey] && { color: attrs[colorKey] }),
              ...(sizeKey && attrs[sizeKey] && { size: attrs[sizeKey] }),
              offers: {
                "@type": "Offer",
                price: priceOf(v).toFixed(2),
                availability: availability(v.stock > 0),
                ...offerCommon,
              },
            };
          }),
        }
      : {
          ...common,
          "@type": "Product",
          sku: variants[0]?.sku || product.sku,
          offers:
            Math.min(...prices) === Math.max(...prices)
              ? { "@type": "Offer", price: prices[0].toFixed(2), availability: availability(inStock), ...offerCommon }
              : {
                  "@type": "AggregateOffer",
                  lowPrice: Math.min(...prices).toFixed(2),
                  highPrice: Math.max(...prices).toFixed(2),
                  offerCount: prices.length,
                  availability: availability(inStock),
                  ...offerCommon,
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
    <main id="main-content" tabIndex={-1} className="outline-none">
      <JsonLd data={productSchema} />
      <Breadcrumb items={crumbs} />
      <ShopDetails product={display} shippingRates={shippingRates} />
      <ProductGrid
        title="You may also like"
        products={related.map((p) => mapProductForDisplay(p as ProductListItem))}
      />
      {(product.brand || product.category_slug) && (
        <nav aria-label="More products" className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-12 flex flex-wrap gap-3 text-custom-sm">
          {product.brand && (
            <Link href={`/brand/${brandSlug(product.brand)}`} className="rounded-full border border-brand-border px-4 py-1.5 text-white hover:border-brand-accent hover:text-brand-accent">
              More from {product.brand}
            </Link>
          )}
          {product.category_slug && (
            <Link href={`/category/${product.category_slug}`} className="rounded-full border border-brand-border px-4 py-1.5 text-white hover:border-brand-accent hover:text-brand-accent">
              More in {product.category_name}
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
