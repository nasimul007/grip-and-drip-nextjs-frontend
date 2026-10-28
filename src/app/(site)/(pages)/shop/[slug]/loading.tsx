import { getT } from "@/lib/i18n";
export default async function Loading() {
  const { t } = await getT();
  return (
    <div className="bg-brand-dark py-8" aria-busy="true">
      <div className="mx-auto grid w-full max-w-[1170px] animate-pulse gap-6 px-4 sm:px-8 md:grid-cols-[minmax(0,480px)_1fr] xl:px-0">
        <div className="aspect-square rounded-lg bg-brand-surface" />
        <div className="space-y-3">
          <div className="h-7 w-4/5 rounded bg-brand-surface" />
          <div className="h-4 w-1/4 rounded bg-brand-surface" />
          <div className="h-8 w-1/3 rounded bg-brand-surface" />
          <div className="h-24 rounded bg-brand-surface" />
          <div className="h-11 w-1/2 rounded bg-brand-surface" />
        </div>
      </div>
      <span className="sr-only">{t("Loading…")}</span>
    </div>
  );
}
