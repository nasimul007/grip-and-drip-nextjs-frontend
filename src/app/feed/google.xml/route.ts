import { SITE_URL, absoluteUrl, mediaUrl, truncate } from "@/lib/site";
import { findCategoryPath, flattenCategories, getCategoryTree, serverGet } from "@/lib/server-api";
import { googleCategory } from "@/lib/google-categories";
import type { PaginatedResponse, ProductListItem } from "@/lib/types";

/** Google Merchant Center product feed (RSS 2.0 + g: namespace), refreshed hourly. */
export const revalidate = 3600;

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const tag = (name: string, value: string | number | undefined | null) =>
  value === undefined || value === null || value === "" ? "" : `<${name}>${esc(String(value))}</${name}>`;
const money = (n: number) => `${n.toFixed(2)} BDT`;

async function allProducts(): Promise<ProductListItem[]> {
  const out: ProductListItem[] = [];
  for (let page = 1; page <= 100; page++) {
    const data = await serverGet<PaginatedResponse<ProductListItem>>(
      `/api/products/?include=variants&page=${page}&page_size=100&ordering=-created_at`,
      3600
    );
    if (!data) break;
    out.push(...data.results);
    if (!data.next) break;
  }
  return out;
}

export async function GET() {
  const [products, tree] = await Promise.all([allProducts(), getCategoryTree()]);
  const flat = flattenCategories(tree);

  const items: string[] = [];
  for (const p of products) {
    if (!p.is_active) continue;
    const gallery = (p.images?.length ? p.images : p.primary_image ? [p.primary_image.image] : [])
      .map((i) => mediaUrl(i))
      .filter(Boolean) as string[];
    const variants = (p.variants || []).filter((v) => v.sku);

    const cat = flat.find((c) => c.slug === p.category_slug);
    const path = cat ? findCategoryPath(tree, cat.id) : null;
    const productType = (path || []).map((c) => c.name).join(" > ") || p.category_name;
    const googleCat = googleCategory(...(path || []).map((c) => c.name), p.category_name);

    const description = truncate(
      p.description || `${p.name}${p.brand ? ` by ${p.brand}` : ""}. Original product with cash on delivery in Bangladesh.`,
      5000
    );
    const list = Number(p.compare_price) || 0;
    const price = Number(p.effective_price);

    const units = variants.length
      ? variants.map((v) => ({
          id: v.sku,
          title: `${p.name} - ${v.name}`,
          link: `${absoluteUrl(`/shop/${p.slug}`)}?variant=${encodeURIComponent(v.sku)}`,
          price: Number(v.price_override ?? price),
          overridden: v.price_override != null,
          stock: v.stock,
          image: mediaUrl(v.image),
          attrs: v.attributes || {},
          group: `P${p.id}`,
        }))
      : [
          {
            id: `P${p.id}`,
            title: p.name,
            link: absoluteUrl(`/shop/${p.slug}`),
            price,
            overridden: false,
            stock: p.total_stock ?? p.stock,
            image: null as string | null,
            attrs: {} as Record<string, string>,
            group: "",
          },
        ];

    for (const u of units) {
      const mainImage = u.image || gallery[0];
      if (!mainImage) continue; // Merchant Center rejects items without an image
      const extra = gallery.filter((g) => g !== mainImage).slice(0, 10);
      const colorKey = Object.keys(u.attrs).find((k) => /colou?r/i.test(k));
      const sizeKey = Object.keys(u.attrs).find((k) => /size|length|capacity/i.test(k));
      const onSale = !u.overridden && list > u.price;

      items.push(
        `<item>` +
          tag("g:id", u.id) +
          tag("g:title", truncate(u.title, 150)) +
          tag("g:description", description) +
          tag("g:link", u.link) +
          tag("g:image_link", mainImage) +
          extra.map((e) => tag("g:additional_image_link", e)).join("") +
          tag("g:availability", u.stock > 0 ? "in_stock" : "out_of_stock") +
          tag("g:price", money(onSale ? list : u.price)) +
          (onSale ? tag("g:sale_price", money(u.price)) : "") +
          tag("g:condition", "new") +
          tag("g:brand", p.brand || "Gadget & Widget") +
          (p.gtin ? tag("g:gtin", p.gtin) : "") +
          (p.mpn ? tag("g:mpn", p.mpn) : "") +
          (!p.gtin && !p.mpn ? tag("g:identifier_exists", "no") : "") +
          tag("g:product_type", productType) +
          tag("g:google_product_category", googleCat) +
          (u.group ? tag("g:item_group_id", u.group) : "") +
          (colorKey ? tag("g:color", u.attrs[colorKey]) : "") +
          (sizeKey ? tag("g:size", u.attrs[sizeKey]) : "") +
          `</item>`
      );
    }
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>` +
    tag("title", "Gadget & Widget products") +
    tag("link", SITE_URL) +
    tag("description", "Product feed for Google Merchant Center") +
    items.join("") +
    `</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
