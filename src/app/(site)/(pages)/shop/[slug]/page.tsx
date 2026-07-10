import type { Metadata } from "next";
import { api } from "@/lib/api";
import type { ProductDetail } from "@/lib/types";
import { mapProductDetailForDisplay } from "@/lib/mappers";
import ShopDetails from "@/components/ShopDetails";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Props = {
  params: Promise<{ slug: string }>;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function getFullUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product: ProductDetail = await api.get(`/api/products/${slug}/`);
    const title = product.meta_title || `${product.name} | Gadget & Widget`;
    const description =
      product.meta_description ||
      (product.description ? stripHtml(product.description).slice(0, 157) : "");
    const ogImageUrl = product.og_image ? getFullUrl(product.og_image) : "";

    return {
      title,
      description,
      alternates: {
        canonical: `${API_BASE}/shop/${slug}/`,
      },
      openGraph: {
        title,
        description,
        type: "website",
        ...(ogImageUrl && {
          images: [{ url: ogImageUrl, width: 1200, height: 1200 }],
        }),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(ogImageUrl && { images: [ogImageUrl] }),
      },
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
      {product?.schema_markup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              ...product.schema_markup,
              "@id": `${API_BASE}/shop/${slug}/#product`,
              url: `${API_BASE}/shop/${slug}/`,
              image: product.og_image ? getFullUrl(product.og_image) : undefined,
            }),
          }}
        />
      )}
      <ShopDetails apiProduct={mapped} />
    </main>
  );
}
