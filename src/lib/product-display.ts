import { stripHtml, truncate } from "./site";

export type KeyDetail = { label: string; value: string };

// Attributes already shown elsewhere in the summary (or not useful as a bullet).
const SKIP_IN_KEY_DETAILS = /^(sku|warranty|brand|model_number|upc|ean)$/i;

export const prettyKey = (key: string) =>
  key.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

/** Non-empty attributes as label/value rows (all of them, for the spec table). */
export function attributeRows(attributes: Record<string, unknown> | undefined): KeyDetail[] {
  return Object.entries(attributes || {})
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
    .map(([k, v]) => ({ label: prettyKey(k), value: String(v) }));
}

/**
 * Short "key details" list for under the title: the first few attributes, or
 * (when the product has none) a one-line summary from the description.
 */
export function getKeyDetails(
  attributes: Record<string, unknown> | undefined,
  description: string | undefined,
  max = 5
): { items: KeyDetail[]; fallback: string } {
  const items = Object.entries(attributes || {})
    .filter(([k, v]) => !SKIP_IN_KEY_DETAILS.test(k) && v !== null && v !== undefined && String(v).trim() !== "")
    .slice(0, max)
    .map(([k, v]) => ({ label: prettyKey(k), value: String(v) }));
  if (items.length) return { items, fallback: "" };
  return { items: [], fallback: truncate(stripHtml(description || ""), 170) };
}
