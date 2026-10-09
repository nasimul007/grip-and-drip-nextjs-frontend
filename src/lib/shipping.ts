import type { ShippingRate } from "./types";

/** Lowest subtotal at which any delivery area becomes free, or null. */
export function freeShippingThreshold(rates: ShippingRate[]): number | null {
  const mins = rates
    .map((r) => (r.free_shipping_minimum != null ? Number(r.free_shipping_minimum) : NaN))
    .filter((n) => Number.isFinite(n) && n > 0);
  return mins.length ? Math.min(...mins) : null;
}
