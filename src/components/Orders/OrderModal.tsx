"use client";
import React, { useEffect, useState } from "react";
import OrderView from "./OrderView";
import { StatusBadge } from "./OrderProgress";
import { api } from "@/lib/api";
import { useReorder } from "@/lib/useReorder";
import { formatOrderDate, fromOrderDetail, type TrackedOrder } from "@/lib/orders";

type Props = { orderId: number; onClose: () => void };

/** Details of one of the signed-in customer's orders; closes on ×, Escape or a click outside. */
const OrderModal = ({ orderId, onClose }: Props) => {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [failed, setFailed] = useState(false);
  const { reorder, busyId } = useReorder();

  useEffect(() => {
    let live = true;
    api
      .get<TrackedOrder>(`/api/orders/${orderId}/`)
      .then((d) => live && setOrder(fromOrderDetail(d)))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [orderId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-99999 flex items-start justify-center overflow-y-auto bg-[#000000CC] px-3 py-6 sm:py-12"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label="Order details" className="relative w-full max-w-[600px] rounded-xl border border-brand-border bg-brand-card">
        <div className="flex items-start justify-between gap-3 border-b border-brand-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-custom-xs text-brand-muted">Order</p>
            <p className="truncate font-semibold text-white">{order ? `#${order.order_number}` : "Loading…"}</p>
            {order && <p className="mt-0.5 text-custom-xs text-brand-muted">Placed {formatOrderDate(order.created_at)}</p>}
          </div>
          <div className="flex items-center gap-3">
            {order && <StatusBadge status={order.status} label={order.status_display} />}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close order details"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-surface text-xl leading-none text-brand-muted hover:text-white"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>

        {order && <OrderView order={order} />}
        {order && order.status !== "cancelled" && (
          <div className="border-t border-brand-border px-4 py-3 sm:px-5">
            <button
              type="button"
              disabled={busyId === orderId}
              onClick={async () => {
                await reorder(orderId);
                onClose();
              }}
              className="w-full rounded-md bg-brand-accent px-5 py-2.5 font-medium text-brand-dark hover:bg-brand-hover disabled:opacity-60 sm:w-auto"
            >
              {busyId === orderId ? "Adding to cart…" : "Reorder these items"}
            </button>
          </div>
        )}
        {!order && !failed && (
          <div className="animate-pulse space-y-3 p-5" aria-busy="true">
            <div className="h-6 rounded bg-brand-surface" />
            <div className="h-14 rounded bg-brand-surface" />
            <div className="h-14 rounded bg-brand-surface" />
          </div>
        )}
        {failed && <p className="p-5 text-sm text-red">We could not load this order. Please try again.</p>}
      </div>
    </div>
  );
};

export default OrderModal;
