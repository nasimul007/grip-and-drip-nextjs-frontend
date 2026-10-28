import { cookies } from "next/headers";
import { BN } from "./bn";
import { LANG_COOKIE, normalizeLang, translate, type Lang } from "./core";

export type { Lang } from "./core";

/** Language chosen by the visitor (cookie), for server components. */
export async function getLang(): Promise<Lang> {
  return normalizeLang((await cookies()).get(LANG_COOKIE)?.value);
}

/** `t()` for server components. */
export async function getT() {
  const lang = await getLang();
  return {
    lang,
    t: (text: string, vars?: Record<string, string | number>) => translate(lang, BN, text, vars),
  };
}
