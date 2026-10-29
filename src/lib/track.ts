/**
 * Thin wrapper over Google Analytics 4 (gtag) and Meta Pixel (fbq).
 * Every call is a no-op until the scripts are loaded (see components/Common/Analytics.tsx),
 * so it is safe to call from anywhere in the browser.
 */

type TrackItem = {
  id: string | number;
  name: string;
  price: number;
  quantity?: number;
  variant?: string;
  brand?: string;
  category?: string;
};

type TrackEvent = "view_item" | "add_to_cart" | "begin_checkout" | "purchase";

type Payload = {
  items: TrackItem[];
  value: number;
  currency?: string;
  transaction_id?: string;
};

type Win = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
};

const FB_EVENT: Record<TrackEvent, string> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
};

export function track(event: TrackEvent, payload: Payload) {
  if (typeof window === "undefined") return;
  const w = window as Win;
  const currency = payload.currency || "BDT";

  try {
    w.gtag?.("event", event, {
      currency,
      value: payload.value,
      ...(payload.transaction_id && { transaction_id: payload.transaction_id }),
      items: payload.items.map((i) => ({
        item_id: String(i.id),
        item_name: i.name,
        price: i.price,
        quantity: i.quantity ?? 1,
        ...(i.variant && { item_variant: i.variant }),
        ...(i.brand && { item_brand: i.brand }),
        ...(i.category && { item_category: i.category }),
      })),
    });
  } catch {}

  try {
    w.fbq?.("track", FB_EVENT[event], {
      currency,
      value: payload.value,
      content_type: "product",
      content_ids: payload.items.map((i) => String(i.id)),
      num_items: payload.items.reduce((n, i) => n + (i.quantity ?? 1), 0),
    });
  } catch {}
}
