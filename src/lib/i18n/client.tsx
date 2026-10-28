"use client";
import React, { createContext, useCallback, useContext, useMemo } from "react";
import { BN } from "./bn";
import { LANG_COOKIE, translate, type Lang } from "./core";

type Ctx = { lang: Lang; t: (text: string, vars?: Record<string, string | number>) => string };

// For code that runs outside React rendering (toasts, event handlers). Client-side only.
let activeLang: Lang = "en";

/** Non-hook translator for toasts and other client-side callbacks. */
export function tt(text: string, vars?: Record<string, string | number>): string {
  return translate(activeLang, BN, text, vars);
}

const LocaleContext = createContext<Ctx>({ lang: "en", t: (text, vars) => translate("en", BN, text, vars) });

export function LocaleProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  activeLang = lang;
  const t = useCallback((text: string, vars?: Record<string, string | number>) => translate(lang, BN, text, vars), [lang]);
  const value = useMemo(() => ({ lang, t }), [lang, t]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** `t()` and the current language for client components. */
export const useT = () => useContext(LocaleContext);

/** Remember the language for a year; callers refresh the page afterwards. */
export function setLangCookie(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}
