"use client";
import React from "react";
import Link from "next/link";
import type { ReduxCartItem } from "@/redux/features/cart-slice";
import { formatPrice } from "@/lib/format";
import FreeShippingProgress from "@/components/Common/FreeShippingProgress";
import FallbackImage from "@/components/Common/FallbackImage";

type Props = {
  cartItems: ReduxCartItem[];
  subtotal: number;
  /** When set, the shipping fee row and total include it (checkout). */
  shippingCost?: number;
  shippingLabel?: string;
  showProceedLink?: boolean;
  sticky?: boolean;
  /** Extra content between the totals and the action (checkout: terms + button). */
  children?: React.ReactNode;
  /** Show the compact item list (checkout). */
  showItems?: boolean;
};

const Row = ({ label, value, muted, strong }: { label: React.ReactNode; value: React.ReactNode; muted?: boolean; strong?: boolean }) => (
  <div className="flex items-baseline justify-between gap-3 py-1.5">
    <span className={muted ? "text-brand-muted" : "text-white"}>{label}</span>
    <span className={strong ? "text-lg font-semibold text-white" : "text-white"}>{value}</span>
  </div>
);

const OrderSummary = ({
  cartItems,
  subtotal,
  shippingCost,
  shippingLabel,
  showProceedLink = true,
  sticky = true,
  showItems = false,
  children,
}: Props) => {
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = subtotal + (shippingCost ?? 0);

  return (
    <div className={sticky ? "lg:sticky lg:top-[calc(var(--header-h,60px)+16px)]" : ""}>
      <div className="rounded-lg border border-brand-border bg-brand-card text-sm">
        <h2 className="border-b border-brand-border px-4 py-3 text-base font-semibold text-white">Order summary</h2>

        {showItems && (
          <ul className="max-h-[320px] overflow-y-auto divide-y divide-brand-border px-4">
            {cartItems.map((item) => (
              <li key={item.lineKey || `${item.id}:${item.variantName || ""}`} className="flex items-center gap-3 py-2.5">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-brand-surface">
                  {item.imgs?.thumbnails?.[0] && (
                    <FallbackImage src={item.imgs.thumbnails[0]} alt="" fill sizes="48px" fallbackLabel="" className="object-cover" />
                  )}
                  <span className="absolute -right-0 -top-0 rounded-bl bg-brand-accent px-1.5 text-[10px] font-semibold text-brand-dark">
                    {item.quantity}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block line-clamp-2 text-white leading-snug">{item.title}</span>
                  {item.variantName && <span className="block text-custom-xs text-brand-muted">{item.variantName}</span>}
                </span>
                <span className="shrink-0 text-white">{formatPrice(item.discountedPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="px-4 py-3 flex flex-col gap-3">
          <div className="border-b border-brand-border pb-2">
            <Row label={`Subtotal (${itemCount} ${itemCount === 1 ? "item" : "items"})`} value={formatPrice(subtotal)} />
            {shippingCost !== undefined ? (
              <Row
                muted
                label={
                  <>
                    Delivery{shippingLabel && <span className="block text-custom-xs">{shippingLabel}</span>}
                  </>
                }
                value={shippingCost === 0 ? <span className="text-brand-accent">Free</span> : formatPrice(shippingCost)}
              />
            ) : (
              <Row muted label="Delivery" value={<span className="text-brand-muted">Calculated at checkout</span>} />
            )}
          </div>

          <Row label="Total" value={formatPrice(total)} strong />
          {shippingCost === undefined && <FreeShippingProgress subtotal={subtotal} />}

          {showProceedLink && (
            <Link
              href="/checkout"
              className="flex h-11 items-center justify-center rounded-md bg-brand-accent font-medium text-brand-dark hover:bg-brand-hover"
            >
              Proceed to checkout
            </Link>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
