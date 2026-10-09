"use client";
import React from "react";
import { formatPrice } from "@/lib/format";
import { freeShippingThreshold, useShippingRates } from "@/lib/useShippingRates";

/** "Add ৳X more for free delivery" with a progress bar. */
export default function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const rates = useShippingRates();
  const threshold = freeShippingThreshold(rates);
  if (!threshold || subtotal <= 0) return null;
  const left = threshold - subtotal;
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
  return (
    <div className="rounded-md bg-brand-surface border border-brand-border px-3 py-2">
      <p className="text-custom-xs text-white mb-1.5">
        {left > 0 ? (
          <>
            Add <span className="font-semibold text-brand-accent">{formatPrice(left)}</span> more for free delivery
          </>
        ) : (
          <span className="text-brand-accent font-medium">You get free delivery on this order</span>
        )}
      </p>
      <div className="h-1.5 rounded-full bg-brand-border overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free delivery">
        <div className="h-full rounded-full bg-brand-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
