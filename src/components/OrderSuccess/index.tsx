"use client";
import { track } from "@/lib/track";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { CONTACT, whatsappHref } from "@/lib/site";
import { PAYMENT_LABEL, deliveryEstimate, loadLastOrder, type LastOrder } from "@/lib/orders";
import { useT } from "@/lib/i18n/client";

const BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER || "";

const OrderSuccess = () => {
  const { t } = useT();
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [copied, setCopied] = useState(false);

  // sessionStorage is only readable in the browser, so load it after mount.
  useEffect(() => {
    const last = loadLastOrder();
    setOrder(last);
    if (!last) return;
    // Report each order once, even if the page is reloaded.
    const key = `tracked-order-${last.order_number}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    track("purchase", { value: Number(last.total), transaction_id: last.order_number, items: [] });
  }, []);

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
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">{t("Order placed")}</h1>
          <p className="mt-2 text-brand-muted">{t("Thank you! We will call you shortly to confirm your order.")}</p>

          {order ? (
            <>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 rounded-lg border border-brand-border bg-brand-surface px-4 py-3">
                <div className="text-left">
                  <p className="text-custom-xs text-brand-muted">{t("Order number")}</p>
                  <p className="font-semibold text-white">{order.order_number}</p>
                </div>
                <button type="button" onClick={copy} className="rounded-md border border-brand-border px-3 py-1.5 text-custom-sm text-white hover:border-brand-accent">
                  {copied ? t("Copied") : t("Copy")}
                </button>
              </div>

              <dl className="mt-5 grid gap-2 text-left text-sm">
                <div className="flex justify-between gap-4"><dt className="text-brand-muted">{t("Total")}</dt><dd className="font-semibold text-white">{formatPrice(order.total)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-brand-muted">{t("Payment")}</dt><dd className="text-white">{t(PAYMENT_LABEL[order.payment_method] || order.payment_method)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-brand-muted">{t("Estimated delivery")}</dt><dd className="text-white">{t(deliveryEstimate(order.shipping_area))} {t("after confirmation")}</dd></div>
              </dl>

              {order.payment_method === "bkash" && (
                <p className="mt-4 rounded-md border border-brand-border bg-brand-surface px-4 py-3 text-left text-sm text-brand-muted">
                  {BKASH_NUMBER ? <>{t("Send")} <span className="text-white">{formatPrice(order.total)}</span> {t("to bKash")} <span className="font-semibold text-brand-accent">{BKASH_NUMBER}</span> {t("and keep the transaction ID. We will confirm once we receive it.")}</> : <>{t("We will message you the bKash number to send")} <span className="text-white">{formatPrice(order.total)}</span> {t("to.")}</>}
                </p>
              )}
              {order.payment_method === "cash" && (
                <p className="mt-4 rounded-md border border-brand-border bg-brand-surface px-4 py-3 text-left text-sm text-brand-muted">
                  {t("Keep")} <span className="text-white">{formatPrice(order.total)}</span> {t("ready to pay the delivery person when your order arrives.")}
                </p>
              )}
            </>
          ) : (
            <p className="mt-5 text-sm text-brand-muted">
              {t("You can follow your order any time with the order number we showed you at checkout.")}
            </p>
          )}

          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-md bg-[#0B7A3E] px-5 py-2.5 font-medium text-white hover:opacity-90">
                {t("Confirm on WhatsApp")}
              </a>
            )}
            <Link href={trackHref} className="rounded-md bg-brand-accent px-5 py-2.5 font-medium text-brand-dark hover:bg-brand-hover">
              {t("Track this order")}
            </Link>
            <Link href="/shop" className="rounded-md border border-brand-border px-5 py-2.5 font-medium text-white hover:border-brand-accent">
              {t("Continue shopping")}
            </Link>
          </div>
          {CONTACT.phone && (
            <p className="mt-5 text-custom-sm text-brand-muted">
              {t("Need to change something? Call")} <a className="text-brand-accent hover:underline" href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a>.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderSuccess;
