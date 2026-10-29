"use client";
import React from "react";
import { useT } from "@/lib/i18n/client";
import type { Address } from "@/lib/types";

type Props = {
  addresses: Address[];
  selectedId: number | null;
  onSelect: (address: Address | null) => void;
};

/** Saved delivery addresses of a signed-in customer; picking one fills the form below. */
export default function SavedAddresses({ addresses, selectedId, onSelect }: Props) {
  const { t } = useT();
  if (addresses.length === 0) return null;

  const card = (active: boolean) =>
    `relative flex w-full cursor-pointer flex-col gap-0.5 rounded-lg border p-3 text-left text-sm transition ${
      active ? "border-brand-accent bg-brand-accent/10" : "border-brand-border bg-brand-surface hover:border-brand-accent"
    }`;

  return (
    <section className="rounded-lg border border-brand-border bg-brand-card" aria-labelledby="saved-addresses-heading">
      <h2 id="saved-addresses-heading" className="border-b border-brand-border px-4 py-3 text-base font-semibold text-white">
        {t("Saved addresses")}
      </h2>
      <div role="radiogroup" aria-labelledby="saved-addresses-heading" className="grid gap-2.5 p-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <button key={a.id} type="button" role="radio" aria-checked={selectedId === a.id} onClick={() => onSelect(a)} className={card(selectedId === a.id)}>
            <span className="flex items-center gap-2">
              <span className="font-medium text-white">{a.address_name || a.area_name}</span>
              {a.is_default_shipping && (
                <span className="rounded bg-brand-accent px-1.5 py-0.5 text-[10px] font-semibold text-brand-dark">{t("Default")}</span>
              )}
            </span>
            {(a.recipient_name || a.phone) && (
              <span className="text-brand-muted">{[a.recipient_name, a.phone].filter(Boolean).join(" · ")}</span>
            )}
            <span className="line-clamp-2 text-brand-muted">
              {a.address}, {a.area_name}, {a.city_name}
            </span>
          </button>
        ))}
        <button type="button" role="radio" aria-checked={selectedId === null} onClick={() => onSelect(null)} className={card(selectedId === null)}>
          <span className="font-medium text-white">+ {t("Use a new address")}</span>
          <span className="text-brand-muted">{t("Type the delivery details below")}</span>
        </button>
      </div>
    </section>
  );
}
