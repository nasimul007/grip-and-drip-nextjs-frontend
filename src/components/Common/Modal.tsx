"use client";
import React, { useEffect, useRef } from "react";
import { useDialogFocus } from "@/lib/useDialogFocus";
import { useT } from "@/lib/i18n/client";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Wider dialog for forms. */
  wide?: boolean;
  busy?: boolean;
};

/** Accessible dialog: closes on ×, Escape or a click outside; focus stays inside while open. */
export default function Modal({ open, title, onClose, children, wide = false, busy = false }: Props) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(ref, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, busy, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-99999 overflow-y-auto bg-[#000000CC] px-3 py-6 sm:py-12"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative mx-auto w-full ${wide ? "max-w-[640px]" : "max-w-[440px]"} rounded-xl border border-brand-border bg-brand-card`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-brand-border px-4 py-3 sm:px-5">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={t("Close")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-surface text-xl leading-none text-brand-muted hover:text-white disabled:opacity-50"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
