"use client";
import React from "react";

type Props = {
  quantity: number;
  /** Highest allowed quantity (stock); omit when unknown. */
  max?: number;
  onChange: (quantity: number) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md";
};

/** − 2 + stepper used in the cart drawer and the cart page. */
export default function QtyStepper({ quantity, max, onChange, disabled, label = "item", size = "md" }: Props) {
  const box = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const btn = `flex items-center justify-center ${box} text-white hover:text-brand-accent disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-white`;
  const atMax = max !== undefined && max > 0 && quantity >= max;
  return (
    <div className="inline-flex items-center rounded-md border border-brand-border bg-brand-surface" role="group" aria-label={`Quantity of ${label}`}>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(quantity - 1)}
        disabled={disabled || quantity <= 1}
        aria-label={`Decrease quantity of ${label}`}
      >
        −
      </button>
      <span className={`flex items-center justify-center ${size === "sm" ? "w-8 text-sm" : "w-10 text-sm"} border-x border-brand-border text-white tabular-nums`} aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(quantity + 1)}
        disabled={disabled || atMax}
        aria-label={atMax ? `Maximum quantity of ${label} reached` : `Increase quantity of ${label}`}
      >
        +
      </button>
    </div>
  );
}
