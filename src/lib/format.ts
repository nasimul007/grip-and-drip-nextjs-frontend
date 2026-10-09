export function formatPrice(value: number | string | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "৳0";
  return `৳${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function discountPercent(list: number, sale: number): number {
  if (!list || !sale || list <= sale) return 0;
  return Math.round(((list - sale) / list) * 100);
}
