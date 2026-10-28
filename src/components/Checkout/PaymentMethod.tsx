"use client";
import React from "react";
import { useT } from "@/lib/i18n/client";

export type PaymentMethodValue = "cash" | "bkash" | "bank";

type Props = {
  payment: PaymentMethodValue;
  bkashNumber: string;
  transactionId: string;
  onPayment: (value: PaymentMethodValue) => void;
  onBkashNumberChange: (value: string) => void;
  onTransactionIdChange: (value: string) => void;
};

const BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER || "01XXX-XXXXXX";

const input =
  "rounded-md border border-brand-border bg-brand-card text-white placeholder:text-brand-muted w-full h-10 px-3.5 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20";

const Option = ({
  id,
  checked,
  disabled,
  onSelect,
  title,
  note,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  note: string;
}) => (
  <label
    htmlFor={id}
    className={`flex items-center gap-3 rounded-md border px-3.5 py-2.5 select-none ${
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-brand-accent"
    } ${checked ? "border-brand-accent bg-brand-surface" : "border-brand-border"}`}
  >
    <input
      type="radio"
      name="payment"
      id={id}
      checked={checked}
      disabled={disabled}
      onChange={onSelect}
      className="h-4 w-4 accent-brand-accent"
    />
    <span>
      <span className="block text-sm font-medium text-white">{title}</span>
      <span className="block text-custom-xs text-brand-muted">{note}</span>
    </span>
  </label>
);

const PaymentMethod = ({
  payment,
  bkashNumber,
  transactionId,
  onPayment,
  onBkashNumberChange,
  onTransactionIdChange,
}: Props) => {
  const { t } = useT();
  return (
  <section className="rounded-lg border border-brand-border bg-brand-card">
    <h2 className="border-b border-brand-border px-4 py-3 text-base font-semibold text-white">{t("Payment method")}</h2>
    <div className="flex flex-col gap-2.5 p-4">
      <Option
        id="pay-cash"
        checked={payment === "cash"}
        onSelect={() => onPayment("cash")}
        title={t("Cash on delivery")}
        note={t("Pay when you receive. Minimum advance ৳200 via bKash to confirm the order.")}
      />

      {payment === "cash" && (
        <div className="rounded-md border border-brand-border bg-brand-surface p-3.5 text-custom-sm">
          <p className="text-white mb-2.5">
            {t("To confirm your order, please send ৳200 by Send Money to the bKash merchant number below, then enter your bKash number and transaction ID in the boxes.")}
          </p>
          <p className="mb-3 flex items-center justify-between gap-3">
            <span className="text-white font-medium">{t("bKash merchant number")}</span>
            <span className="font-semibold text-brand-accent">{BKASH_NUMBER}</span>
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="bkashNumber" className="block mb-1.5 text-white">{t("Your bKash number")}</label>
              <input id="bkashNumber" type="text" inputMode="tel" value={bkashNumber} onChange={(e) => onBkashNumberChange(e.target.value)} placeholder="01XXXXXXXXX" className={input} />
            </div>
            <div>
              <label htmlFor="transactionId" className="block mb-1.5 text-white">{t("Transaction ID")}</label>
              <input id="transactionId" type="text" value={transactionId} onChange={(e) => onTransactionIdChange(e.target.value)} placeholder={t("Transaction ID")} className={input} />
            </div>
          </div>
        </div>
      )}

      <Option
        id="pay-bank"
        checked={payment === "bank"}
        disabled
        onSelect={() => onPayment("bank")}
        title={t("Bank / card payment")}
        note={t("Coming soon")}
      />
    </div>
  </section>
  );
};

export default PaymentMethod;
