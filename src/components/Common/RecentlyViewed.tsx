"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import FallbackImage from "@/components/Common/FallbackImage";
import { formatPrice } from "@/lib/format";
import { mediaPath } from "@/lib/media";
import { getRecentlyViewed, type ViewedProduct } from "@/lib/recently-viewed";
import { useT } from "@/lib/i18n/client";

/** Horizontal strip of products the shopper looked at before; hidden when there are none. */
export default function RecentlyViewed({ excludeSlug, className = "" }: { excludeSlug?: string; className?: string }) {
  const { t } = useT();
  const [items, setItems] = useState<ViewedProduct[]>([]);

  // localStorage is only available in the browser.
  useEffect(() => setItems(getRecentlyViewed(excludeSlug)), [excludeSlug]);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="recently-viewed-heading" className={className}>
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <h2 id="recently-viewed-heading" className="mb-3 text-lg font-semibold text-white">{t("Recently viewed")}</h2>
        <ul className="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
          {items.map((p) => (
            <li key={p.slug} className="w-36 shrink-0 snap-start sm:w-44">
              <Link href={`/shop/${p.slug}`} className="block overflow-hidden rounded-lg border border-brand-border bg-brand-card hover:border-brand-accent">
                <span className="relative block aspect-square bg-brand-surface">
                  {p.image ? <FallbackImage src={mediaPath(p.image)} alt="" fill sizes="176px" fallbackLabel="" className="object-cover" /> : null}
                </span>
                <span className="block p-2.5">
                  <span className="line-clamp-2 min-h-[2.5rem] text-custom-sm leading-snug text-white">{p.title}</span>
                  <span className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold text-white">{formatPrice(p.discountedPrice)}</span>
                    {p.price > p.discountedPrice && <span className="text-custom-xs text-brand-muted line-through">{formatPrice(p.price)}</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
