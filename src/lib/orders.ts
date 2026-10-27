export type TrackedOrder = {
  order_number: string;
  status: string;
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

/** Steps of a normal order; "cancelled" is shown separately. */
export const ORDER_STEPS = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Packing" },
  { key: "shipped", label: "On the way" },
  { key: "delivered", label: "Delivered" },
] as const;

export const PAYMENT_LABEL: Record<string, string> = {
  cash: "Cash on delivery",
  bkash: "bKash",
  bank: "Bank transfer",
};

/** Working-day delivery window shown to the customer. */
export function deliveryEstimate(area: string | undefined): string {
  if (area === "inside_dhaka") return "1–2 working days";
  if (area === "outside_dhaka") return "3–5 working days";
  return "2–5 working days";
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
