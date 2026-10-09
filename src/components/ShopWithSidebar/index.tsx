"use client";
import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import PriceDropdown, { FALLBACK_MAX_PRICE } from "./PriceDropdown";
import BrandDropdown from "./BrandDropdown";
import ProductItem from "../Common/ProductItem";
import SingleListItem from "../Shop/SingleListItem";
import { CloseIcon } from "../Common/icons";
import { mapProductForDisplay } from "@/lib/mappers";
import { formatPrice } from "@/lib/format";
import { PAGE_SIZE, SORT_OPTIONS, activeFilterCount, parseFilters } from "@/lib/shop-query";
import type { ProductListItem } from "@/lib/types";

type CategoryData = {
  id: number;
  name: string;
  slug: string;
  children?: CategoryData[];
};

export type Facets = {
  brands: { name: string; count: number }[];
  price: { min: number; max: number };
} | null;

type Props = {
  categories: CategoryData[];
  initialData: { results: ProductListItem[]; count: number } | null;
  facets?: Facets;
  /** Category page: products are always limited to this category (and its children). */
  lockedCategoryId?: number;
};

function pageList(page: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "...")[] = [1];
  if (page > 3) out.push("...");
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) out.push(i);
  if (page < total - 2) out.push("...");
  out.push(total);
  return out;
}

function flatten(nodes: CategoryData[]): CategoryData[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children || [])]);
}

const Chip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <button
    type="button"
    onClick={onRemove}
    aria-label={`Remove filter ${label}`}
    className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-card py-1 pl-3 pr-2 text-custom-sm text-white hover:border-brand-accent"
  >
    {label}
    <CloseIcon size={14} />
  </button>
);

const ShopWithSidebar = ({ categories, initialData, facets = null, lockedCategoryId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  // Products come from the server page; changing the URL re-renders it with new data.
  const data = initialData;
  const [loading, startTransition] = useTransition();
  const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const priceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Local copy so the checkbox responds instantly while the URL/page update.
  const [stockOnly, setStockOnly] = useState(filters.stock);
  useEffect(() => setStockOnly(filters.stock), [filters.stock]);

  const rangeMin = facets?.price ? facets.price.min : 0;
  const rangeMax = facets?.price && facets.price.max > facets.price.min ? facets.price.max : facets?.price ? facets.price.min + 1 : FALLBACK_MAX_PRICE;
  const brands = facets?.brands ?? [];
  const nFilters = activeFilterCount(filters, !!lockedCategoryId);

  // Lock page scroll and close with Escape while the mobile filter panel is open.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const hrefWith = (patch: Record<string, string | string[] | null>, keepPage = false) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      p.delete(k);
      if (Array.isArray(v)) v.forEach((x) => p.append(k, x));
      else if (v) p.set(k, v);
    });
    if (!keepPage) p.delete("page");
    const qs = p.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const update = (patch: Record<string, string | string[] | null>) =>
    startTransition(() => router.replace(hrefWith(patch), { scroll: false }));

  const handleCategory = (id: string) => {
    const next = filters.categories.includes(id)
      ? filters.categories.filter((c) => c !== id)
      : [...filters.categories, id];
    update({ category: next });
  };

  const handlePrice = (min: number, max: number) => {
    clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(
      () =>
        update({
          min: min > rangeMin ? String(min) : null,
          max: max < rangeMax ? String(max) : null,
        }),
      400
    );
  };

  const handleClearAll = () => {
    update({ category: null, min: null, max: null, brand: null, q: null, stock: null });
    setResetCounter((c) => c + 1);
  };

  const products = (data?.results || []).map(mapProductForDisplay);
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const firstShown = totalCount ? (filters.page - 1) * PAGE_SIZE + 1 : 0;
  const lastShown = Math.min(filters.page * PAGE_SIZE, totalCount);
  const categoryNames = useMemo(() => new Map(flatten(categories).map((c) => [String(c.id), c.name])), [categories]);

  return (
    <section className="relative pb-20 pt-5 bg-brand-dark">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex gap-7.5">
          {/* Mobile backdrop */}
          {sidebarOpen && (
            <div
              className="xl:hidden fixed inset-0 z-[9998] bg-[#000000B3]"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Filters: slide-in panel on small screens, sticky column on desktop */}
          <aside
            aria-label="Product filters"
            className={`fixed z-9999 left-0 top-0 h-full w-full max-w-[320px] flex flex-col bg-brand-surface ease-out duration-200 xl:static xl:z-auto xl:h-auto xl:max-w-[270px] xl:w-[270px] xl:shrink-0 xl:translate-x-0 xl:bg-transparent xl:block xl:sticky xl:top-[calc(var(--header-h,60px)+16px)] xl:self-start xl:max-h-[calc(100vh-var(--header-h,60px)-32px)] xl:overflow-y-auto no-scrollbar ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex shrink-0 items-center justify-between px-4 py-3 xl:rounded-lg xl:border xl:border-brand-border xl:bg-brand-card xl:mb-2">
              <p className="text-white font-medium">
                Filters{nFilters > 0 && <span className="ml-1.5 text-brand-accent">({nFilters})</span>}
              </p>
              <div className="flex items-center gap-3">
                {nFilters > 0 && (
                  <button type="button" onClick={handleClearAll} className="text-custom-sm text-brand-accent hover:underline">
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="xl:hidden text-white"
                  aria-label="Close filters"
                >
                  <CloseIcon size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="flex-1 min-h-0 overflow-y-auto xl:overflow-visible px-3 pb-3 xl:px-0 xl:pb-0 flex flex-col gap-2">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-brand-border bg-brand-card px-4 py-3 text-white select-none">
                <span>In stock only</span>
                <input
                  type="checkbox"
                  checked={stockOnly}
                  onChange={(e) => {
                    setStockOnly(e.target.checked);
                    update({ stock: e.target.checked ? "1" : null });
                  }}
                  className="h-4 w-4 accent-brand-accent"
                />
              </label>

              <PriceDropdown
                key={`${resetCounter}-${rangeMin}-${rangeMax}`}
                rangeMin={rangeMin}
                rangeMax={rangeMax}
                initialMin={filters.min}
                initialMax={filters.max}
                onPriceChange={handlePrice}
              />

              {!lockedCategoryId && (
                <CategoryDropdown
                  categories={categories}
                  selectedIds={filters.categories}
                  onSelectCategory={handleCategory}
                />
              )}

              {lockedCategoryId && categories.length > 0 && (
                <nav aria-label="Subcategories" className="bg-brand-card border border-brand-border rounded-lg px-4 py-3">
                  <p className="text-white mb-2">Subcategories</p>
                  <ul className="flex flex-col gap-1.5 text-custom-sm">
                    {categories.map((c) => (
                      <li key={c.id}>
                        <Link href={`/category/${c.slug}`} className="hover:text-brand-accent">
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {brands.length > 0 && (
                <BrandDropdown
                  brands={brands}
                  selectedBrand={filters.brand}
                  onSelectBrand={(b) => update({ brand: b === filters.brand ? null : b })}
                />
              )}
            </form>

            <div className="xl:hidden shrink-0 border-t border-brand-border bg-brand-surface p-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="h-11 w-full rounded-md bg-brand-accent font-medium text-brand-dark"
              >
                {loading ? "Updating…" : `Show ${totalCount} product${totalCount === 1 ? "" : "s"}`}
              </button>
            </div>
          </aside>

          {/* Results */}
          <div className="min-w-0 flex-1">
            <div className="rounded-lg bg-brand-card border border-brand-border pl-3 pr-2.5 py-2.5 mb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <CustomSelect
                    key={filters.sort}
                    options={SORT_OPTIONS}
                    defaultValue={filters.sort}
                    onChange={(o) => update({ sort: o.value === "-created_at" ? null : o.value })}
                  />
                  <p className="hidden sm:block" aria-live="polite">
                    {totalCount > 0 ? (
                      <>
                        Showing <span className="text-white">{firstShown}–{lastShown}</span> of{" "}
                        <span className="text-white">{totalCount}</span> products
                      </>
                    ) : (
                      "No products"
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label={`Open filters${nFilters ? `, ${nFilters} applied` : ""}`}
                    aria-expanded={sidebarOpen}
                    className="xl:hidden flex items-center gap-2 h-9 px-3 rounded-[5px] border border-brand-border bg-brand-card text-white text-custom-sm hover:border-brand-accent"
                  >
                    Filters
                    {nFilters > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-accent px-1 text-custom-xs font-semibold text-brand-dark">
                        {nFilters}
                      </span>
                    )}
                  </button>
                  {(["grid", "list"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setProductStyle(style)}
                      aria-label={style === "grid" ? "Grid view" : "List view"}
                      aria-pressed={productStyle === style}
                      className={`${
                        productStyle === style
                          ? "bg-brand-accent border-brand-accent text-brand-dark"
                          : "text-white bg-brand-card border-brand-border"
                      } hidden sm:flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:border-brand-accent`}
                    >
                      {style === "grid" ? (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                          <rect x="1.5" y="1.5" width="6.5" height="6.5" rx="1.5" />
                          <rect x="10" y="1.5" width="6.5" height="6.5" rx="1.5" />
                          <rect x="1.5" y="10" width="6.5" height="6.5" rx="1.5" />
                          <rect x="10" y="10" width="6.5" height="6.5" rx="1.5" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                          <rect x="1.5" y="2" width="15" height="6" rx="1.5" />
                          <rect x="1.5" y="10" width="15" height="6" rx="1.5" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filters */}
            {nFilters > 0 && (
              <div className="mb-3 flex flex-wrap items-center gap-2" aria-label="Active filters">
                {filters.q && <Chip label={`Search: ${filters.q}`} onRemove={() => update({ q: null })} />}
                {filters.brand && <Chip label={filters.brand} onRemove={() => update({ brand: null })} />}
                {(filters.min > 0 || filters.max > 0) && (
                  <Chip
                    label={`${formatPrice(filters.min || rangeMin)} – ${formatPrice(filters.max || rangeMax)}`}
                    onRemove={() => {
                      update({ min: null, max: null });
                      setResetCounter((c) => c + 1);
                    }}
                  />
                )}
                {filters.stock && <Chip label="In stock" onRemove={() => update({ stock: null })} />}
                {!lockedCategoryId &&
                  filters.categories.map((id) => (
                    <Chip
                      key={id}
                      label={categoryNames.get(id) || "Category"}
                      onRemove={() => update({ category: filters.categories.filter((c) => c !== id) })}
                    />
                  ))}
                <button type="button" onClick={handleClearAll} className="ml-1 text-custom-sm text-brand-accent hover:underline">
                  Clear all
                </button>
              </div>
            )}

            <div
              aria-busy={loading}
              className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""} ${
                productStyle === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3"
                  : "flex flex-col gap-4"
              }`}
            >
              {products.length === 0 && !loading && (
                <div className="col-span-full py-10 text-center">
                  <p className="text-white mb-3">
                    {filters.q ? `No products found for "${filters.q}".` : "No products match these filters."}
                  </p>
                  {nFilters > 0 && (
                    <button type="button" onClick={handleClearAll} className="text-brand-accent hover:underline">
                      Clear filters
                    </button>
                  )}
                  {categories.length > 0 && !lockedCategoryId && (
                    <div className="mt-5">
                      <p className="mb-2 text-custom-sm">Or browse a category</p>
                      <ul className="flex flex-wrap justify-center gap-2">
                        {categories.slice(0, 8).map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/category/${c.slug}`}
                              className="inline-block rounded-full border border-brand-border px-4 py-1.5 text-custom-sm text-white hover:border-brand-accent hover:text-brand-accent"
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {products.map((item, i) =>
                productStyle === "grid" ? (
                  <ProductItem item={item} key={item.id} priority={i < 4 && filters.page === 1} />
                ) : (
                  <SingleListItem item={item} key={item.id} />
                )
              )}
            </div>

            {totalPages > 1 && (
              <nav aria-label="Pagination" className="flex justify-center mt-10">
                <ul className="flex items-center bg-brand-card border border-brand-border rounded-md p-2">
                  <li>
                    {filters.page > 1 ? (
                      <Link
                        href={hrefWith({ page: filters.page - 1 > 1 ? String(filters.page - 1) : null }, true)}
                        rel="prev"
                        aria-label="Previous page"
                        className="flex items-center justify-center w-8 h-9 rounded-[3px] text-white hover:bg-brand-hover"
                      >
                        ‹
                      </Link>
                    ) : (
                      <span className="flex items-center justify-center w-8 h-9 text-brand-muted" aria-hidden="true">‹</span>
                    )}
                  </li>
                  {pageList(filters.page, totalPages).map((num, i) =>
                    num === "..." ? (
                      <li key={`dots-${i}`}>
                        <span className="flex py-1.5 px-3.5 text-brand-muted">…</span>
                      </li>
                    ) : (
                      <li key={num}>
                        <Link
                          href={hrefWith({ page: num > 1 ? String(num) : null }, true)}
                          aria-current={num === filters.page ? "page" : undefined}
                          className={`flex py-1.5 px-3.5 duration-200 rounded-[3px] ${
                            num === filters.page ? "bg-brand-accent text-brand-dark" : "text-white hover:bg-brand-hover"
                          }`}
                        >
                          {num}
                        </Link>
                      </li>
                    )
                  )}
                  <li>
                    {filters.page < totalPages ? (
                      <Link
                        href={hrefWith({ page: String(filters.page + 1) }, true)}
                        rel="next"
                        aria-label="Next page"
                        className="flex items-center justify-center w-8 h-9 rounded-[3px] text-white hover:bg-brand-hover"
                      >
                        ›
                      </Link>
                    ) : (
                      <span className="flex items-center justify-center w-8 h-9 text-brand-muted" aria-hidden="true">›</span>
                    )}
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopWithSidebar;
