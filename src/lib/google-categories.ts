/**
 * Maps a store category name to a Google product category (text path form,
 * accepted by Merchant Center). Unmatched categories fall back to "Electronics";
 * check Merchant Center Diagnostics after the first fetch and extend this table.
 */
const MAP: Array<[RegExp, string]> = [
  [/charg|adapter/i, "Electronics > Electronics Accessories > Power > Power Adapters & Chargers"],
  [/cable/i, "Electronics > Electronics Accessories > Cables"],
  [/ear(phone|bud|pod)|headphone|headset|airpod/i, "Electronics > Audio > Audio Components > Headphones & Headsets"],
  [/speaker/i, "Electronics > Audio > Audio Components > Speakers"],
  [/watch|wearable|band/i, "Apparel & Accessories > Jewelry > Watches"],
];

export function googleCategory(...names: Array<string | undefined>): string {
  const text = names.filter(Boolean).join(" ");
  return MAP.find(([re]) => re.test(text))?.[1] ?? "Electronics";
}
