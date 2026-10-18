/** Helpers for choosing a product variant when attributes (e.g. Length x Color) are only partly combined. */

export type VariantLike = {
  id?: number;
  stock: number;
  is_active?: boolean;
  sort_order?: number;
  attributes?: Record<string, string>;
};

export type SelectedAttrs = Record<string, string>;

export const slugifyAttr = (v: unknown) => String(v ?? "").toLowerCase().replace(/\s+/g, "-");

const attrOf = (v: VariantLike, key: string) => slugifyAttr(v.attributes?.[key]);

/** True when the variant has every selected attribute value. */
export function variantMatches(v: VariantLike, attrs: SelectedAttrs): boolean {
  return Object.entries(attrs).every(([key, val]) => attrOf(v, key) === val);
}

/** Selected attributes taken from a variant (empty values skipped). */
export function attrsOf(v: VariantLike | undefined): SelectedAttrs {
  const out: SelectedAttrs = {};
  Object.entries(v?.attributes || {}).forEach(([k, val]) => {
    if (val) out[k] = slugifyAttr(val);
  });
  return out;
}

/** In-stock first, then lowest sort_order. */
const byPreference = (a: VariantLike, b: VariantLike) =>
  Number(b.stock > 0) - Number(a.stock > 0) || (a.sort_order ?? 0) - (b.sort_order ?? 0);

export function defaultVariant<T extends VariantLike>(variants: T[]): T | undefined {
  return [...variants].sort(byPreference)[0];
}

/**
 * The variant to select after the shopper picks `value` for `key`.
 * Keeps the other current choices when that combination exists, otherwise falls
 * back to the best variant that has the chosen value.
 */
export function pickVariantFor<T extends VariantLike>(
  variants: T[],
  current: SelectedAttrs,
  key: string,
  value: string
): T | undefined {
  const withValue = variants.filter((v) => attrOf(v, key) === value);
  if (withValue.length === 0) return undefined;
  const wanted = { ...current, [key]: value };
  const exact = withValue.filter((v) => variantMatches(v, wanted)).sort(byPreference)[0];
  if (exact) return exact;
  // Keep as many of the other current choices as possible.
  const score = (v: T) =>
    Object.entries(wanted).filter(([k, val]) => k !== key && attrOf(v, k) === val).length;
  return [...withValue].sort((a, b) => score(b) - score(a) || byPreference(a, b))[0];
}

/** Whether `value` for `key` exists together with the other current choices. */
export function isOptionAvailable(
  variants: VariantLike[],
  current: SelectedAttrs,
  key: string,
  value: string
): boolean {
  const wanted = { ...current, [key]: value };
  return variants.some((v) => variantMatches(v, wanted));
}
