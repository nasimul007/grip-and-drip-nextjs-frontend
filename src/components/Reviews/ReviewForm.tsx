"use client";
import React, { useState } from "react";
import { api } from "@/lib/api";
import { useAppSelector } from "@/redux/store";
import { useT } from "@/lib/i18n/client";

const input =
  "w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-white placeholder:text-brand-muted outline-none focus:border-brand-accent";

type Props = { slug: string; defaultOrder?: string; onDone: () => void };

/** Star picker + text for a verified buyer; guests prove the purchase with order number and phone. */
export default function ReviewForm({ slug, defaultOrder = "", onDone }: Props) {
  const { t } = useT();
  const isAuthenticated = useAppSelector((s) => s.authReducer.isAuthenticated);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [orderNumber, setOrderNumber] = useState(defaultOrder);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [thanks, setThanks] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return setError(t("Choose a star rating."));
    setBusy(true);
    setError("");
    try {
      const res = await api.post<{ detail: string }>(`/api/products/${slug}/reviews/`, {
        rating,
        title: title.trim(),
        body: body.trim(),
        order_number: orderNumber.trim(),
        phone: phone.trim(),
      });
      setThanks(res.detail);
      onDone();
    } catch (err) {
      setError((err as Error).message || t("Could not send your review."));
    } finally {
      setBusy(false);
    }
  };

  if (thanks) {
    return <p role="status" className="rounded-md border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 text-sm text-white">{thanks}</p>;
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-brand-border bg-brand-card p-4" noValidate>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-white">{t("Your rating")}</legend>
        <div role="radiogroup" aria-label={t("Rating")} className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} ${n > 1 ? t("stars") : t("star")}`}
              onClick={() => setRating(n)}
              className={`text-2xl leading-none ${n <= rating ? "text-[#FFA645]" : "text-[#4B4B55] hover:text-[#FFA645]"}`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-3 grid gap-3">
        <label className="block text-sm text-white">
          {t("Title")} <span className="text-brand-muted">({t("optional")})</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={`${input} mt-1`} />
        </label>
        <label className="block text-sm text-white">
          {t("Your review")} <span className="text-brand-muted">({t("optional")})</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} rows={4} className={`${input} mt-1`} />
        </label>
        <div className={`grid gap-3 ${isAuthenticated ? "" : "sm:grid-cols-2"}`}>
          <label className="block text-sm text-white">
            {t("Order number")} {isAuthenticated && <span className="text-brand-muted">({t("optional")})</span>}
            <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="ORD-20260101-0001" autoCapitalize="characters" className={`${input} mt-1`} />
          </label>
          {!isAuthenticated && (
            <label className="block text-sm text-white">
              {t("Phone used at checkout")}
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" className={`${input} mt-1`} />
            </label>
          )}
        </div>
        <p className="text-custom-xs text-brand-muted">{t("Only customers with a delivered order for this product can review it. Reviews appear after approval.")}</p>
      </div>

      {error && <p role="alert" className="mt-3 text-sm text-red">{error}</p>}
      <button type="submit" disabled={busy} className="mt-4 rounded-md bg-brand-accent px-5 py-2.5 text-sm font-medium text-brand-dark hover:bg-brand-hover disabled:opacity-60">
        {busy ? t("Sending…") : t("Submit review")}
      </button>
    </form>
  );
}
