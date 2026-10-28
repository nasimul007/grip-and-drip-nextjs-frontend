import React from "react";
import { ORDER_STEPS, type StatusStep } from "@/lib/orders";
import { useT } from "@/lib/i18n/client";

/** Status steps exactly as the backend defines them; highlights up to the current one. */
export function OrderProgress({ status, steps }: { status: string; steps?: StatusStep[] }) {
  const { t } = useT();
  if (status === "cancelled") {
    return (
      <p className="rounded-md border border-red bg-red-light-6/10 px-4 py-3 text-sm text-white">
        {t("This order was cancelled. If you did not ask for this, please contact us.")}
      </p>
    );
  }
  const list = steps && steps.length ? steps : ORDER_STEPS;
  const current = Math.max(0, list.findIndex((s) => s.key === status));
  return (
    <ol className="grid gap-1" style={{ gridTemplateColumns: `repeat(${list.length}, minmax(0, 1fr))` }} aria-label={t("Order progress")}>
      {list.map((step, i) => {
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
              <span className={`h-0.5 flex-1 ${i === list.length - 1 ? "opacity-0" : i < current ? "bg-brand-accent" : "bg-brand-border"}`} />
            </span>
            <span className={`mt-1.5 text-[11px] leading-tight sm:text-custom-xs ${done ? "text-white" : "text-brand-muted"}`}>{t(step.label)}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const { t } = useT();
  const tone =
    status === "delivered"
      ? "bg-[#22AD5C26] text-green"
      : status === "cancelled"
      ? "bg-[#F2303026] text-red"
      : "bg-[#FBBF2426] text-yellow";
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-custom-xs font-medium ${tone}`}>{t(label || status)}</span>;
}
