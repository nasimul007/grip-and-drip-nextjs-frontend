import React from "react";
import FallbackImage from "@/components/Common/FallbackImage";
import { OrderProgress } from "./OrderProgress";
import { formatPrice } from "@/lib/format";
import { mediaPath } from "@/lib/media";
import { PAYMENT_LABEL, deliveryEstimate, type TrackedOrder } from "@/lib/orders";

/** Progress, items (with photos), totals and delivery info of one order. */
export default function OrderView({ order }: { order: TrackedOrder }) {
  return (
    <>
      <div className="px-4 py-5 sm:px-5">
        <OrderProgress status={order.status} steps={order.status_steps} />
        {order.status !== "cancelled" && order.status !== "delivered" && (
          <p className="mt-4 text-center text-sm text-brand-muted">
            Estimated delivery: <span className="text-white">{deliveryEstimate(order.shipping_area)}</span> from confirmation
          </p>
        )}
      </div>

      <ul className="divide-y divide-brand-border border-t border-brand-border px-4 sm:px-5">
        {order.items.map((item, i) => (
          <li key={`${item.product_slug}-${i}`} className="flex items-center gap-3 py-3">
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-brand-surface">
              {item.product_image ? (
                <FallbackImage src={mediaPath(item.product_image)} alt="" fill sizes="56px" fallbackLabel="" className="object-cover" />
              ) : null}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block line-clamp-2 text-white">{item.product_name}</span>
              <span className="block text-custom-xs text-brand-muted">
                {item.variant_name ? `${item.variant_name} · ` : ""}
                {formatPrice(item.price)} × {item.quantity}
              </span>
            </span>
            <span className="shrink-0 text-sm font-medium text-white">{formatPrice(Number(item.price) * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <dl className="grid gap-1.5 border-t border-brand-border px-4 py-4 text-sm sm:px-5">
        <div className="flex justify-between"><dt className="text-brand-muted">Subtotal</dt><dd className="text-white">{formatPrice(order.subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-brand-muted">Delivery</dt><dd className="text-white">{Number(order.shipping_cost) > 0 ? formatPrice(order.shipping_cost) : "Free"}</dd></div>
        <div className="flex justify-between border-t border-brand-border pt-2 font-semibold"><dt className="text-white">Total</dt><dd className="text-white">{formatPrice(order.total)}</dd></div>
        <div className="flex justify-between pt-1"><dt className="text-brand-muted">Payment</dt><dd className="text-white">{PAYMENT_LABEL[order.payment_method] || order.payment_method}</dd></div>
        {order.delivery_area && (
          <div className="flex justify-between gap-4"><dt className="shrink-0 text-brand-muted">Delivering to</dt><dd className="text-right text-white">{order.customer_name ? `${order.customer_name}, ` : ""}{order.delivery_area}</dd></div>
        )}
      </dl>
    </>
  );
}
