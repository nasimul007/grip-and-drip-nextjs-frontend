"use client";
import React from "react";
import { useT } from "@/lib/i18n/client";

const STAR = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

/** Read-only star rating with partial fill (e.g. 4.3). */
export default function Stars({ value, size = 14, className = "" }: { value: number; size?: number; className?: string }) {
  const { t } = useT();
  const v = Math.max(0, Math.min(5, value));
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={t("Rated {n} out of 5", { n: v.toFixed(1) })}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, v - i));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id={`star-${size}-${i}-${Math.round(fill * 100)}`}>
                <stop offset={`${fill * 100}%`} stopColor="#FFA645" />
                <stop offset={`${fill * 100}%`} stopColor="#4B4B55" />
              </linearGradient>
            </defs>
            <path d={STAR} fill={`url(#star-${size}-${i}-${Math.round(fill * 100)})`} />
          </svg>
        );
      })}
    </span>
  );
}
