"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { setLangCookie, useT } from "@/lib/i18n/client";
import type { Lang } from "@/lib/i18n/core";

/** EN | বাংলা switch; remembers the choice in a cookie and reloads the page's data. */
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang } = useT();
  const router = useRouter();

  const choose = (next: Lang) => {
    if (next === lang) return;
    setLangCookie(next);
    router.refresh();
  };

  const btn = (code: Lang, label: string, aria: string) => (
    <button
      type="button"
      onClick={() => choose(code)}
      aria-pressed={lang === code}
      aria-label={aria}
      lang={code}
      className={`px-2 py-0.5 rounded text-custom-xs font-medium ${lang === code ? "bg-brand-accent text-brand-dark" : "text-white hover:text-brand-accent"}`}
    >
      {label}
    </button>
  );

  return (
    <div role="group" aria-label="Language" className={`inline-flex items-center gap-0.5 rounded-md border border-brand-border p-0.5 ${className}`}>
      {btn("en", "EN", "English")}
      {btn("bn", "বাংলা", "বাংলা")}
    </div>
  );
}
