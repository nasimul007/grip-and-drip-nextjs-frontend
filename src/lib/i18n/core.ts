export type Lang = "en" | "bn";
export const LANG_COOKIE = "lang";
export const DEFAULT_LANG: Lang = "en";

export function normalizeLang(value: string | undefined | null): Lang {
  return value === "bn" ? "bn" : "en";
}

type Vars = Record<string, string | number>;

/**
 * Translate an English UI string. The English text itself is the key, so a missing
 * Bangla entry simply shows English. `{name}` placeholders are filled from `vars`.
 */
export function translate(lang: Lang, dict: Record<string, string>, text: string, vars?: Vars): string {
  const raw = lang === "bn" ? dict[text] ?? text : text;
  return vars ? raw.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : raw;
}
