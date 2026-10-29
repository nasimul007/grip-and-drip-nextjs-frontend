import { SITE_NAME } from "@/lib/site";

/**
 * Default intro copy for category and brand pages with no hand-written text.
 * Mixes natural English and Bangla search phrases ("price in Bangladesh", "দাম"),
 * since shoppers search both ways. Text written in the admin always wins.
 */

const BANGLA_TERMS: Array<[RegExp, string]> = [
  [/charg/i, "চার্জার"],
  [/ear(phone|bud|pod)|headphone|headset/i, "ইয়ারফোন"],
  [/watch/i, "স্মার্টওয়াচ"],
  [/cable/i, "ক্যাবল"],
  [/speaker/i, "স্পিকার"],
  [/power ?bank/i, "পাওয়ার ব্যাংক"],
];

function banglaTerm(name: string): string | null {
  return BANGLA_TERMS.find(([re]) => re.test(name))?.[1] ?? null;
}

export function categoryIntro(name: string, productCount: number): string {
  const bn = banglaTerm(name);
  const lower = name.toLowerCase();
  return (
    `Buy original ${lower} online in Bangladesh at ${SITE_NAME}. ` +
    `Compare ${productCount} ${productCount === 1 ? "product" : "products"} with genuine quality, warranty where applicable, ` +
    `cash on delivery and fast delivery across Bangladesh.` +
    (bn ? ` ${bn} এর সেরা দাম ও অরিজিনাল পণ্য — ${name} price in Bangladesh.` : "")
  );
}

export function brandIntro(name: string, productCount: number): string {
  return (
    `Buy original ${name} products in Bangladesh at ${SITE_NAME}. Browse ${productCount} ${name} ` +
    `${productCount === 1 ? "product" : "products"} with genuine quality, warranty where applicable, ` +
    `cash on delivery and fast delivery across Bangladesh. ${name} এর অরিজিনাল পণ্যের দাম ও অফার।`
  );
}
