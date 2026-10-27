"use client";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import FallbackImage from "@/components/Common/FallbackImage";
import { api } from "@/lib/api";
import { useAppSelector } from "@/redux/store";
import { formatPrice } from "@/lib/format";
import { CONTACT, whatsappHref } from "@/lib/site";
import {
  ORDER_STEPS,
  PAYMENT_LABEL,
  deliveryEstimate,
  formatOrderDate,
  type TrackedOrder,
} from "@/lib/orders";
import type { OrderListItem, PaginatedResponse } from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-brand-border bg-brand-surface px-3.5 py-2.5 text-white placeholder:text-brand-muted outline-none focus:border-brand-accent";

function Progress({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <p className="rounded-md border border-red bg-red-light-6/10 px-4 py-3 text-sm text-white">
        This order was cancelled. If you did not ask for this, please contact us.
      </p>
    );
  }
  const current = Math.max(0, ORDER_STEPS.findIndex((s) => s.key === status));
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Order progress">
      {ORDER_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step.key} className="flex flex-col items-center text-center" aria-current={i === current ? "step" : undefined}>
            <span className="flex w-full items-center">
              <span className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : i <= current ? "bg-brand-accent" : "bg-brand-border"}`} />
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                  done ? "border-brand-accent bg-brand-accent text-brand-dark" : "border-brand-border bg-brand-surface text-brand-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={`h-0.5 flex-1 ${i === ORDER_STEPS.length - 1 ? "opacity-0" : i < current ? "bg-brand-accent" : "bg-brand-border"}`} />
            </span>
            <span className={`mt-1.5 text-[11px] leading-tight sm:text-custom-xs ${done ? "text-white" : "text-brand-muted"}`}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderResult({ order }: { order: TrackedOrder }) {
  const help = whatsappHref(`Hi, I need help with order ${order.order_number}.`);
  return (
    <div className="rounded-lg border border-brand-border bg-brand-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border px-4 py-3">
        <div>
          <p className="text-custom-xs text-brand-muted">Order</p>
          <p className="font-semibold text-white">#{order.order_number}</p>
        </div>
        <p className="text-custom-sm text-brand-muted">Placed {formatOrderDate(order.created_at)}</p>
      </div>

      <div className="px-4 py-5">
        <Progress status={order.status} />
        {order.status !== "cancelled" && order.status !== "delivered" && (
          <p className="mt-4 text-center text-sm text-brand-muted">
            Estimated delivery: <span className="text-white">{deliveryEstimate(order.shipping_area)}</span> from confirmation
          </p>
        )}
      </div>

      <ul className="divide-y divide-brand-border border-t border-brand-border px-4">
        {order.items.map((item, i) => (
          <li key={`${item.product_slug}-${i}`} className="flex items-center gap-3 py-3">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-brand-surface">
              {item.product_image && (
                <FallbackImage src={item.product_image.replace(/^https?:\/\/[^/]+(?=\/media\/)/, "")} alt="" fill sizes="48px" fallbackLabel="" className="object-cover" />
              )}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block line-clamp-2 text-white">{item.product_name}</span>
              <span className="block text-custom-xs text-brand-muted">
                {item.variant_name ? `${item.variant_name} · ` : ""}Qty {item.quantity}
              </span>
            </span>
            <span className="text-sm text-white">{formatPrice(Number(item.price) * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <dl className="grid gap-1.5 border-t border-brand-border px-4 py-4 text-sm">
        <div className="flex justify-between"><dt className="text-brand-muted">Subtotal</dt><dd className="text-white">{formatPrice(order.subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-brand-muted">Delivery</dt><dd className="text-white">{Number(order.shipping_cost) > 0 ? formatPrice(order.shipping_cost) : "Free"}</dd></div>
        <div className="flex justify-between border-t border-brand-border pt-2 font-semibold"><dt className="text-white">Total</dt><dd className="text-white">{formatPrice(order.total)}</dd></div>
        <div className="flex justify-between pt-1"><dt className="text-brand-muted">Payment</dt><dd className="text-white">{PAYMENT_LABEL[order.payment_method] || order.payment_method}</dd></div>
        {order.delivery_area && (
          <div className="flex justify-between gap-4"><dt className="shrink-0 text-brand-muted">Delivering to</dt><dd className="text-right text-white">{order.customer_name ? `${order.customer_name}, ` : ""}{order.delivery_area}</dd></div>
        )}
      </dl>

      <div className="flex flex-wrap gap-3 border-t border-brand-border px-4 py-4 text-sm">
        {help && (
          <a href={help} target="_blank" rel="noopener noreferrer" className="rounded-md bg-[#25D366] px-4 py-2 font-medium text-white hover:opacity-90">
            Ask about this order on WhatsApp
          </a>
        )}
        {CONTACT.phone && (
          <a href={`tel:${CONTACT.phone}`} className="rounded-md border border-brand-border px-4 py-2 text-white hover:border-brand-accent">
            Call {CONTACT.phone}
          </a>
        )}
        <Link href="/shop" className="rounded-md border border-brand-border px-4 py-2 text-white hover:border-brand-accent">Continue shopping</Link>
      </div>
    </div>
  );
}

function TrackOrderInner() {
  const params = useSearchParams();
  const isAuthenticated = useAppSelector((state) => state.authReducer.isAuthenticated);

  const [number, setNumber] = useState(params.get("order") || "");
  const [phone, setPhone] = useState(params.get("phone") || "");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mine, setMine] = useState<OrderListItem[]>([]);

  const lookup = useCallback(async (orderNumber: string, phoneNumber: string) => {
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      setOrder(await api.post<TrackedOrder>("/api/orders/track/", { order_number: orderNumber.trim(), phone: phoneNumber.trim() }));
    } catch (err) {
      setError((err as Error).message || "Could not look up this order. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // A link from the order confirmation page fills the form and looks the order up.
  useEffect(() => {
    const o = params.get("order");
    const p = params.get("phone");
    if (o && p) lookup(o, p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Signed-in customers can open their own orders without typing a phone number.
  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .get<PaginatedResponse<OrderListItem> | OrderListItem[]>("/api/orders/list/")
      .then((data) => setMine(Array.isArray(data) ? data : data.results || []))
      .catch(() => {});
  }, [isAuthenticated]);

  const openMine = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      const detail = await api.get<TrackedOrder & { shipping_address?: { full_name: string; city: string } }>(`/api/orders/${id}/`);
      setOrder({
        ...detail,
        customer_name: detail.customer_name ?? detail.shipping_address?.full_name?.split(" ")[0] ?? "",
        delivery_area: detail.delivery_area ?? detail.shipping_address?.city ?? "",
      });
    } catch (err) {
      setError((err as Error).message || "Could not load this order.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim() || !phone.trim()) {
      setError("Enter your order number and the phone number used at checkout.");
      return;
    }
    lookup(number, phone);
  };

  return (
    <>
      <Breadcrumb title="Track your order" items={[{ name: "Track order" }]} />
      <section className="bg-brand-dark pb-16 pt-4">
        <div className="mx-auto w-full max-w-[760px] px-4 sm:px-8 xl:px-0">
          {isAuthenticated && mine.length > 0 && (
            <div className="mb-5 rounded-lg border border-brand-border bg-brand-card p-4">
              <p className="mb-2 text-sm font-semibold text-white">Your recent orders</p>
              <ul className="flex flex-col gap-1.5">
                {mine.slice(0, 5).map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => openMine(o.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-left text-sm hover:border-brand-accent"
                    >
                      <span className="text-white">#{o.order_number}</span>
                      <span className="text-brand-muted">{formatOrderDate(o.created_at)}</span>
                      <span className="capitalize text-brand-accent">{o.status}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-custom-xs text-brand-muted">
                All orders are in <Link href="/my-account" className="text-brand-accent hover:underline">My account</Link>.
              </p>
            </div>
          )}

          <form onSubmit={onSubmit} className="rounded-lg border border-brand-border bg-brand-card p-4 sm:p-5" noValidate>
            <p className="mb-3 text-sm text-brand-muted">
              {isAuthenticated ? "Placed an order as a guest? Look it up with its number and phone." : "Enter the order number from your confirmation and the phone number you used at checkout."}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm text-white">
                Order number
                <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="ORD-20260101-0001" autoComplete="off" autoCapitalize="characters" className={`${inputClass} mt-1.5`} />
              </label>
              <label className="block text-sm text-white">
                Phone number
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" className={`${inputClass} mt-1.5`} />
              </label>
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-red">{error}</p>}
            <button type="submit" disabled={loading} className="mt-4 rounded-md bg-brand-accent px-6 py-2.5 font-medium text-brand-dark hover:bg-brand-hover disabled:opacity-60">
              {loading ? "Checking…" : "Track order"}
            </button>
          </form>

          {order && (
            <div className="mt-5" aria-live="polite">
              <OrderResult order={order} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

const TrackOrder = () => (
  <Suspense fallback={null}>
    <TrackOrderInner />
  </Suspense>
);

export default TrackOrder;
