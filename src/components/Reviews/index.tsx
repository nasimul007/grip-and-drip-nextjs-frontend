"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Stars from "@/components/Common/Stars";
import ReviewForm from "./ReviewForm";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n/client";

type Review = { id: number; reviewer_name: string; rating: number; title: string; body: string; created_at: string };
type Data = { average: number | null; count: number; results: Review[] };

/** Approved reviews of a product plus the "write a review" form. */
export default function Reviews({ slug }: { slug: string }) {
  const { t } = useT();
  const params = useSearchParams();
  const [data, setData] = useState<Data | null>(null);
  const [open, setOpen] = useState(params.get("review") === "1");

  const load = useCallback(() => {
    api.get<Data>(`/api/products/${slug}/reviews/`).then(setData).catch(() => setData({ average: null, count: 0, results: [] }));
  }, [slug]);
  useEffect(load, [load]);

  const count = data?.count ?? 0;
  return (
    <div>
      {count > 0 && data?.average != null && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-3xl font-semibold text-white">{data.average.toFixed(1)}</span>
          <div>
            <Stars value={data.average} size={18} />
            <p className="text-custom-sm text-brand-muted">{count} {count > 1 ? t("reviews") : t("review")} {t("from verified buyers")}</p>
          </div>
        </div>
      )}

      {count === 0 && data && (
        <p className="mb-4 text-sm text-brand-muted">{t("No reviews yet. Bought this product? Be the first to share what you think.")}</p>
      )}

      {count > 0 && (
        <ul className="mb-5 divide-y divide-brand-border rounded-lg border border-brand-border bg-brand-card">
          {data!.results.map((r) => (
            <li key={r.id} className="px-4 py-3.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Stars value={r.rating} size={14} />
                {r.title && <span className="font-medium text-white">{r.title}</span>}
              </div>
              {r.body && <p className="mt-1.5 whitespace-pre-line text-sm text-brand-muted">{r.body}</p>}
              <p className="mt-1.5 text-custom-xs text-brand-muted">
                {r.reviewer_name} · {t("Verified purchase")} · {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <ReviewForm slug={slug} defaultOrder={params.get("order") || ""} onDone={load} />
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="rounded-md border border-brand-border px-5 py-2.5 text-sm font-medium text-white hover:border-brand-accent">
          {t("Write a review")}
        </button>
      )}
    </div>
  );
}
