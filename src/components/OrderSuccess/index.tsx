"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { CONTACT, whatsappHref } from "@/lib/site";
import { PAYMENT_LABEL, deliveryEstimate, loadLastOrder, type LastOrder } from "@/lib/orders";

const BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER || "";

const OrderSuccess = () => {
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [copied, setCopied] = useState(false);

  // sessionStorage is only readable in the browser, so load it after mount.
  useEffect(() => setOrder(loadLastOrder()), []);

  const copy = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const whatsapp = order
    ? whatsappHref(`Hi, I just placed order ${order.order_number} (${formatPrice(order.total)}). Please confirm it.`)
    : null;
  const trackHref = order
    ? `/track-order?order=${encodeURIComponent(order.order_number)}&phone=${encodeURIComponent(order.phone)}`
    : "/track-order";

  return (
    <section className="bg-brand-dark py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[640px] px-4 sm:px-8 xl:px-0">
        <div className="rounded-xl border border-brand-border bg-brand-card px-4 py-8 text-center sm:px-8">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/10">
            <svg className="h-8 w-8 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Order placed</h1>
          <p className="mt-2 text-brand-muted">Thank you! We will call you shortly to confirm your order.</p>

          {order ? (
            <>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 rounded-lg border border-brand-border bg-brand-surface px-4 py-3">
                <div className="text-left">
                  <p className="text-custom-xs text-brand-muted">Order number</p>
                  <p className="font-semibold text-white">{order.order_number}</p>
                </div>
                <button type="button" onClick={copy} className="rounded-md border border-brand-border px-3 py-1.5 text-custom-sm text-white hover:border-brand-accent">
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <dl className="mt-5 grid gap-2 text-left text-sm">
                <div className="flex justify-between gap-4"><dt className="text-brand-muted">Total</dt><dd className="font-semibold text-white">{formatPrice(order.total)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-brand-muted">Payment</dt><dd className="text-white">{PAYMENT_LABEL[order.payment_method] || order.payment_method}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-brand-muted">Estimated delivery</dt><dd className="text-white">{deliveryEstimate(order.shipping_area)} after confirmation</dd></div>
              </dl>

              {order.payment_method === "bkash" && (
                <p className="mt-4 rounded-md border border-brand-border bg-brand-surface px-4 py-3 text-left text-sm text-brand-muted">
                  {BKASH_NUMBER ? <>Send <span className="text-white">{formatPrice(order.total)}</span> to bKash <span className="font-semibold text-brand-accent">{BKASH_NUMBER}</span> and keep the transaction ID. We will confirm once we receive it.</> : <>We will message you the bKash number to send <span className="text-white">{formatPrice(order.total)}</span> to.</>}
                </p>
              )}
              {order.payment_method === "cash" && (
                <p className="mt-4 rounded-md border border-brand-border bg-brand-surface px-4 py-3 text-left text-sm text-brand-muted">
                  Keep <span className="text-white">{formatPrice(order.total)}</span> ready to pay the delivery person when your order arrives.
                </p>
              )}
            </>
          ) : (
            <p className="mt-5 text-sm text-brand-muted">
              You can follow your order any time with the order number we showed you at checkout.
            </p>
          )}

          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-md bg-[#0B7A3E] px-5 py-2.5 font-medium text-white hover:opacity-90">
                Confirm on WhatsApp
              </a>
            )}
            <Link href={trackHref} className="rounded-md bg-brand-accent px-5 py-2.5 font-medium text-brand-dark hover:bg-brand-hover">
              Track this order
            </Link>
            <Link href="/shop" className="rounded-md border border-brand-border px-5 py-2.5 font-medium text-white hover:border-brand-accent">
              Continue shopping
            </Link>
          </div>
          {CONTACT.phone && (
            <p className="mt-5 text-custom-sm text-brand-muted">
              Need to change something? Call <a className="text-brand-accent hover:underline" href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a>.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderSuccess;
