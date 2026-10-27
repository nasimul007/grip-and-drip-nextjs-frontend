export default function Loading() {
  return (
    <div className="bg-brand-dark py-10" aria-busy="true" aria-live="polite">
      <div className="mx-auto w-full max-w-[1170px] animate-pulse px-4 sm:px-8 xl:px-0">
        <div className="mb-6 h-7 w-1/3 rounded bg-brand-surface" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-brand-border bg-brand-card">
              <div className="aspect-square rounded-t-lg bg-brand-surface" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-4/5 rounded bg-brand-surface" />
                <div className="h-4 w-1/2 rounded bg-brand-surface" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
