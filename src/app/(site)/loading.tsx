import { getT } from "@/lib/i18n";
import { ProductSkeletons } from "@/components/Common/ProductSkeleton";

export default async function Loading() {
  const { t } = await getT();
  return (
    <div className="bg-brand-dark py-10" aria-busy="true" aria-live="polite">
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="mb-6 h-7 w-1/3 animate-pulse rounded bg-brand-surface" />
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-4">
          <ProductSkeletons count={8} />
        </div>
      </div>
      <span className="sr-only">{t("Loading…")}</span>
    </div>
  );
}
