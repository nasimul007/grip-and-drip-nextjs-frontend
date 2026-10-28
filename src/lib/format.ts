export function formatPrice(value: number | string | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "৳0";
  return `৳${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function discountPercent(list: number, sale: number): number {
  if (!list || !sale || list <= sale) return 0;
  return Math.round(((list - sale) / list) * 100);
}

/** Prices at or above this show the discount as a taka amount instead of a percentage. */
const AMOUNT_BADGE_FROM = 10000;

/** Short badge for cards: "-20%" for everyday prices, "-৳1,500" for expensive items. */
export function discountBadge(list: number, sale: number): string {
  const pct = discountPercent(list, sale);
  if (!pct) return "";
  return list >= AMOUNT_BADGE_FROM ? `-${formatPrice(list - sale)}` : `-${pct}%`;
}

/** Product page wording: "Save ৳500 (20%)". */
export function discountSaveText(list: number, sale: number): string {
  const pct = discountPercent(list, sale);
  if (!pct) return "";
  return `Save ${formatPrice(list - sale)} (${pct}%)`;
}

/** 6 -> "6 months", 12 -> "1 year", 24 -> "2 years", 18 -> "18 months". */
type Translate = (text: string, vars?: Record<string, string | number>) => string;

export function formatWarranty(months: number | null | undefined, t?: Translate): string {
  const m = Number(months);
  if (!m || m <= 0) return "";
  const tr: Translate = t || ((text, vars) => text.replace(/\{(\w+)\}/g, (_, k) => String(vars?.[k] ?? "")));
  if (m % 12 === 0) return m === 12 ? tr("1 year") : tr("{n} years", { n: m / 12 });
  return tr("{n} months", { n: m });
}
