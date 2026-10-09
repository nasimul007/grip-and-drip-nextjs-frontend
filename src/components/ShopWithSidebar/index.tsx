"use client";
import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import PriceDropdown, { MAX_PRICE } from "./PriceDropdown";
import BrandDropdown from "./BrandDropdown";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import { mapProductForDisplay } from "@/lib/mappers";
import { PAGE_SIZE, SORT_OPTIONS, parseFilters } from "@/lib/shop-query";
import type { ProductListItem } from "@/lib/types";

type CategoryData = {
  id: number;
  name: string;
  slug: string;
  children?: CategoryData[];
};

type Props = {
  categories: CategoryData[];
  initialData: { results: ProductListItem[]; count: number } | null;
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

const ShopWithSidebar = ({ categories, initialData, lockedCategoryId }: Props) => {
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

  useEffect(() => {
    if (!sidebarOpen) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".sidebar-content")) setSidebarOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
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
          min: min > 0 ? String(min) : null,
          max: max > 0 && max < MAX_PRICE ? String(max) : null,
        }),
      400
    );
  };

  const handleClearAll = () => {
    update({ category: null, min: null, max: null, brand: null, q: null });
    setResetCounter((c) => c + 1);
  };

  const products = (data?.results || []).map(mapProductForDisplay);
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const brands = Array.from(
    new Set([...(data?.results || []).map((p) => p.brand), filters.brand].filter(Boolean))
  ) as string[];
  const firstShown = totalCount ? (filters.page - 1) * PAGE_SIZE + 1 : 0;
  const lastShown = Math.min(filters.page * PAGE_SIZE, totalCount);

  return (
    <section className="relative overflow-x-hidden pb-20 pt-7.5 bg-brand-dark">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex gap-7.5">
          {/* Sidebar */}
          <aside
            aria-label="Product filters"
            className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 ${
              sidebarOpen ? "translate-x-0 bg-brand-card p-5 h-screen overflow-y-auto" : "-translate-x-full"
            }`}
          >
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="xl:hidden absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-md bg-brand-card border border-brand-border text-white hover:bg-brand-hover z-10"
              aria-label="Close filters"
            >
              ✕
            </button>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-2">
                <div className="bg-brand-card border border-brand-border rounded-lg py-4 px-5 flex items-center justify-between">
                  <p className="text-white">Filters</p>
                  <button type="button" onClick={handleClearAll} className="text-brand-accent">
                    Clear all
                  </button>
                </div>

                <PriceDropdown
                  key={resetCounter}
                  initialMin={filters.min}
                  initialMax={filters.max || MAX_PRICE}
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
                  <nav aria-label="Subcategories" className="bg-brand-card border border-brand-border rounded-lg py-4 px-5">
                    <p className="text-white mb-3">Subcategories</p>
                    <ul className="flex flex-col gap-2 text-custom-sm">
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

                <BrandDropdown
                  brands={brands}
                  selectedBrand={filters.brand}
                  onSelectBrand={(b) => update({ brand: b === filters.brand ? null : b })}
                />
              </div>
            </form>
          </aside>

          {/* Content */}
          <div className="xl:max-w-[870px] w-full">
            <div className="rounded-lg bg-brand-card border border-brand-border pl-3 pr-2.5 py-2.5 mb-4">
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
                    aria-label="Open filters"
                    aria-expanded={sidebarOpen}
                    className="xl:hidden flex items-center justify-center h-9 px-3 rounded-[5px] border border-brand-border bg-brand-card text-white text-custom-sm hover:border-brand-accent"
                  >
                    Filters
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

            {filters.q && (
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-brand-muted text-sm">
                  Results for <span className="text-white font-medium">&ldquo;{filters.q}&rdquo;</span>
                </p>
                <button type="button" onClick={() => update({ q: null })} className="text-brand-accent hover:underline text-sm">
                  Clear search
                </button>
              </div>
            )}

            <div
              aria-busy={loading}
              className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""} ${
                productStyle === "grid"
                  ? "grid grid-cols-2 lg:grid-cols-4 gap-x-2.5 gap-y-7.5"
                  : "flex flex-col gap-7.5"
              }`}
            >
              {products.length === 0 && !loading && (
                <div className="col-span-full text-center py-10">
                  <p className="text-white mb-3">
                    {filters.q ? `No products found for "${filters.q}".` : "No products match these filters."}
                  </p>
                  <button type="button" onClick={handleClearAll} className="text-brand-accent hover:underline">
                    Clear filters
                  </button>
                </div>
              )}
              {products.map((item) =>
                productStyle === "grid" ? (
                  <SingleGridItem item={item} key={item.id} />
                ) : (
                  <SingleListItem item={item} key={item.id} />
                )
              )}
            </div>

            {totalPages > 1 && (
              <nav aria-label="Pagination" className="flex justify-center mt-15">
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
