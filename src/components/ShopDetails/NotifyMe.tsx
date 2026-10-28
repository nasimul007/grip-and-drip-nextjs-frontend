"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n/client";

type Props = { slug: string; variantId?: number; label?: string };

/** "Tell me when it is back" for an out-of-stock product or variant. */
export default function NotifyMe({ slug, variantId, label }: Props) {
  const { t } = useT();
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  // Picking another variant starts a fresh request.
  useEffect(() => {
    setState("idle");
    setError("");
  }, [slug, variantId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setError(t("Enter your mobile number or email."));
      return;
    }
    setState("sending");
    setError("");
    try {
      await api.post(`/api/products/${slug}/notify/`, { contact: contact.trim(), variant_id: variantId ?? null });
      setState("done");
    } catch (err) {
      setError((err as Error).message || t("Could not save your request. Please try again."));
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <p role="status" className="mt-3 rounded-md border border-brand-accent/40 bg-brand-accent/10 px-3 py-2.5 text-sm text-white">
        {t("Done. We will contact you as soon as {item} is back in stock.", { item: label || t("this item") })}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded-lg border border-brand-border bg-brand-card p-3" noValidate>
      <p className="text-sm font-medium text-white">{t("Out of stock")}{label ? `: ${label}` : ""}</p>
      <p className="mb-2 text-custom-xs text-brand-muted">{t("Leave your mobile number or email and we will tell you when it is back.")}</p>
      <div className="flex flex-wrap gap-2">
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={t("01XXXXXXXXX or email")}
          autoComplete="tel"
          aria-label={t("Mobile number or email")}
          className="h-10 min-w-0 flex-1 rounded-md border border-brand-border bg-brand-surface px-3 text-sm text-white placeholder:text-brand-muted outline-none focus:border-brand-accent"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="h-10 rounded-md bg-brand-accent px-4 text-sm font-medium text-brand-dark hover:bg-brand-hover disabled:opacity-60"
        >
          {state === "sending" ? t("Saving…") : t("Notify me")}
        </button>
      </div>
      {error && <p role="alert" className="mt-1.5 text-custom-xs text-red">{error}</p>}
    </form>
  );
}
