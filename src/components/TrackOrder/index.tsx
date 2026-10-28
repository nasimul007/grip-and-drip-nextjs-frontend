"use client";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import OrderView from "@/components/Orders/OrderView";
import { StatusBadge } from "@/components/Orders/OrderProgress";
import { api } from "@/lib/api";
import { useAppSelector } from "@/redux/store";
import { CONTACT, whatsappHref } from "@/lib/site";
import { formatOrderDate, fromOrderDetail, type TrackedOrder } from "@/lib/orders";
import type { OrderListItem, PaginatedResponse } from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-brand-border bg-brand-surface px-3.5 py-2.5 text-white placeholder:text-brand-muted outline-none focus:border-brand-accent";

function OrderResult({ order }: { order: TrackedOrder }) {
  const help = whatsappHref(`Hi, I need help with order ${order.order_number}.`);
  return (
    <div className="rounded-lg border border-brand-border bg-brand-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border px-4 py-3 sm:px-5">
        <div>
          <p className="text-custom-xs text-brand-muted">Order</p>
          <p className="font-semibold text-white">#{order.order_number}</p>
        </div>
        <div className="text-right">
          <StatusBadge status={order.status} label={order.status_display} />
          <p className="mt-0.5 text-custom-xs text-brand-muted">Placed {formatOrderDate(order.created_at)}</p>
        </div>
      </div>

      <OrderView order={order} />

      <div className="flex flex-wrap gap-3 border-t border-brand-border px-4 py-4 text-sm sm:px-5">
        {help && (
          <a href={help} target="_blank" rel="noopener noreferrer" className="rounded-md bg-[#0B7A3E] px-4 py-2 font-medium text-white hover:opacity-90">
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
      setOrder(fromOrderDetail(await api.get<TrackedOrder>(`/api/orders/${id}/`)));
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
                      <StatusBadge status={o.status} label={o.status_display} />
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
