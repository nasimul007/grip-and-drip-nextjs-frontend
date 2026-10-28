import { DELIVERY_TIME } from "@/lib/site";

export type StatusStep = { key: string; label: string };

export type TrackedOrder = {
  order_number: string;
  status: string;
  /** Label for `status` as set in the backend (falls back to the key). */
  status_display?: string;
  /** The order's normal path of statuses, from the backend (cancelled excluded). */
  status_steps?: StatusStep[];
  payment_method: "cash" | "bkash" | "bank";
  subtotal: number | string;
  shipping_cost: number | string;
  total: number | string;
  shipping_area: "inside_dhaka" | "outside_dhaka" | "";
  customer_name: string;
  delivery_area: string;
  created_at: string;
  updated_at: string;
  items: {
    product_name: string;
    product_slug: string;
    product_image: string;
    price: number | string;
    quantity: number;
    variant_name: string;
  }[];
};

/** Used only when the API does not send `status_steps`; mirrors the backend Order.STATUS_CHOICES. */
export const ORDER_STEPS: StatusStep[] = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

/** Signed-in order detail (`/api/orders/<id>/`) in the shape the order view uses. */
export function fromOrderDetail(
  detail: TrackedOrder & { shipping_address?: { full_name?: string; city?: string } }
): TrackedOrder {
  return {
    ...detail,
    customer_name: detail.customer_name ?? detail.shipping_address?.full_name?.split(" ")[0] ?? "",
    delivery_area: detail.delivery_area ?? detail.shipping_address?.city ?? "",
  };
}

export const PAYMENT_LABEL: Record<string, string> = {
  cash: "Cash on delivery",
  bkash: "bKash",
  bank: "Bank transfer",
};

/** Working-day delivery window shown to the customer. */
export function deliveryEstimate(area: string | undefined): string {
  if (area === "inside_dhaka") return DELIVERY_TIME.insideDhaka;
  if (area === "outside_dhaka") return DELIVERY_TIME.outsideDhaka;
  return `${DELIVERY_TIME.insideDhaka} – ${DELIVERY_TIME.outsideDhaka}`;
}

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const LAST_ORDER_KEY = "last_order";

export type LastOrder = {
  order_number: string;
  total: number;
  payment_method: string;
  shipping_area: string;
  phone: string;
  item_count: number;
};

export function saveLastOrder(order: LastOrder) {
  try {
    sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  } catch {}
}

export function loadLastOrder(): LastOrder | null {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_KEY);
    return raw ? (JSON.parse(raw) as LastOrder) : null;
  } catch {
    return null;
  }
}
