import React from "react";
import { StatusBadge } from "./OrderProgress";
import { formatPrice } from "@/lib/format";
import { formatOrderDate } from "@/lib/orders";
import type { OrderListItem } from "@/lib/types";

type Props = { order: OrderListItem; onOpen: () => void };

/** One order as a row on desktop and a compact card on phones. */
const SingleOrder = ({ order, onOpen }: Props) => (
  <li>
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View order ${order.order_number}`}
      className="grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-3.5 text-left hover:bg-brand-surface sm:grid-cols-[1.5fr_1fr_1fr_90px_24px] sm:px-5"
    >
      <span className="min-w-0">
        <span className="block truncate font-medium text-white">#{order.order_number}</span>
        <span className="block text-custom-xs text-brand-muted sm:hidden">
          {formatOrderDate(order.created_at)} · {order.item_count} {order.item_count === 1 ? "item" : "items"}
        </span>
        <span className="hidden text-custom-xs text-brand-muted sm:block">{order.item_count} {order.item_count === 1 ? "item" : "items"}</span>
      </span>
      <span className="hidden text-sm text-brand-muted sm:block">{formatOrderDate(order.created_at)}</span>
      <span className="order-last justify-self-end sm:order-none sm:justify-self-start">
        <StatusBadge status={order.status} label={order.status_display} />
      </span>
      <span className="text-sm font-semibold text-white sm:text-right">{formatPrice(order.total)}</span>
      <span aria-hidden="true" className="hidden text-brand-muted sm:block">›</span>
    </button>
  </li>
);

export default SingleOrder;
