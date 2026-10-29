/** Placeholder with the same box as a product card, so loading causes no layout shift. */
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-brand-border bg-brand-card animate-pulse" aria-hidden="true">
      <div className="aspect-square bg-brand-surface" />
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="h-4 w-11/12 rounded bg-brand-surface" />
        <div className="h-4 w-2/3 rounded bg-brand-surface" />
        <div className="mt-1 h-5 w-1/3 rounded bg-brand-surface" />
        <div className="mt-auto h-9 rounded-md bg-brand-surface" />
      </div>
    </div>
  );
}

/** List-view row placeholder. */
export function ProductRowSkeleton() {
  return (
    <div className="flex gap-4 rounded-lg border border-brand-border bg-brand-card p-3 animate-pulse" aria-hidden="true">
      <div className="h-32 w-32 shrink-0 rounded-md bg-brand-surface sm:h-40 sm:w-40" />
      <div className="flex flex-1 flex-col gap-2.5 py-1">
        <div className="h-5 w-3/4 rounded bg-brand-surface" />
        <div className="h-4 w-1/2 rounded bg-brand-surface" />
        <div className="h-6 w-1/4 rounded bg-brand-surface" />
        <div className="mt-auto h-9 w-40 rounded-md bg-brand-surface" />
      </div>
    </div>
  );
}

export function ProductSkeletons({ count = 8, list = false }: { count?: number; list?: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (list ? <ProductRowSkeleton key={i} /> : <ProductCardSkeleton key={i} />))}
    </>
  );
}
