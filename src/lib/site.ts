export const SITE_NAME = "Gadget & Widget";
export const SITE_TAGLINE = "Gadgets & Accessories in Bangladesh";
export const SITE_DESCRIPTION =
  "Shop original chargers, earbuds, headphones, smartwatches, cables, speakers and mobile accessories online in Bangladesh. Cash on delivery and bKash, fast delivery inside and outside Dhaka.";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

export const DEFAULT_OG_IMAGE = "/images/logo/g_w_dark_side_by_side01-removebg-preview.png";

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Absolute URL for a media path returned by the API. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function stripHtml(html: string): string {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, max = 158): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

/** Robots value for pages that must stay out of search results. */
export const NO_INDEX = { index: false, follow: true } as const;

// Contact details shown in the footer and contact page. Replace with real values.
export const CONTACT = {
  address: "Dhaka, Bangladesh",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
};

export const PAYMENT_METHODS = ["Cash on Delivery", "bKash", "Bank Transfer"];
