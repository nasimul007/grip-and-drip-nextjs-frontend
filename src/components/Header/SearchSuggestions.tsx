"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { mediaPath } from "@/lib/media";
import { addRecentSearch, clearRecentSearches, getRecentSearches } from "@/lib/recent-searches";
import FallbackImage from "@/components/Common/FallbackImage";
import type { PaginatedResponse, ProductListItem } from "@/lib/types";

export type PopularLink = { label: string; href: string };

type Props = {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  /** Category links offered when the box is empty or nothing matches. */
  popular?: PopularLink[];
};

/** Bolds the part of `text` that matches `term`. */
function Highlight({ text, term }: { text: string; term: string }) {
  const t = term.trim();
  const i = t ? text.toLowerCase().indexOf(t.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold text-white">{text.slice(i, i + t.length)}</mark>
      {text.slice(i + t.length)}
    </>
  );
}

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);

const SearchSuggestions = ({ query, isOpen, onClose, popular = [] }: Props) => {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);

  const q = query.trim();

  useEffect(() => {
    if (isOpen && !q) setRecent(getRecentSearches());
  }, [isOpen, q]);

  useEffect(() => {
    if (!q || !isOpen) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    let live = true;
    setLoading(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ search: q, page_size: "6" });
      api
        .get<PaginatedResponse<ProductListItem>>(`/api/products/?${params.toString()}`)
        .then((data) => live && setSuggestions(data.results))
        .catch(() => live && setSuggestions([]))
        .finally(() => live && setLoading(false));
    }, 250);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [q, isOpen]);

  useEffect(() => setActiveIndex(-1), [suggestions, recent, q]);

  const go = (href: string, saveQuery?: string) => {
    if (saveQuery) addRecentSearch(saveQuery);
    onClose();
    router.push(href);
  };

  // Arrow keys / Enter / Escape work while typing in the search box (focus stays in the input).
  useEffect(() => {
    if (!isOpen) return;
    const items: { href: string; save?: string }[] = q
      ? suggestions.map((s) => ({ href: `/shop/${s.slug}`, save: q }))
      : recent.map((r) => ({ href: `/shop?q=${encodeURIComponent(r)}`, save: r }));

    const onKey = (e: KeyboardEvent) => {
      const inside = rootRef.current?.parentElement?.contains(e.target as Node);
      if (!inside) return;
      if (e.key === "Escape") return onClose();
      if (!items.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i < items.length - 1 ? i + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : items.length - 1));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        go(items[activeIndex].href, items[activeIndex].save);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, q, suggestions, recent, activeIndex]);

  if (!isOpen) return null;

  const rowClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-2.5 ease-out duration-150 ${active ? "bg-brand-hover text-white" : "text-brand-muted hover:bg-brand-hover hover:text-white"}`;

  const popularChips = popular.length > 0 && (
    <div className="px-4 pb-3">
      <p className="mb-2 text-custom-xs uppercase tracking-wide text-brand-muted">Popular categories</p>
      <div className="flex flex-wrap gap-2">
        {popular.map((p) => (
          <Link key={p.href} href={p.href} onClick={onClose} className="rounded-full border border-brand-border px-3 py-1 text-custom-sm text-white hover:border-brand-accent hover:text-brand-accent">
            {p.label}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      role="listbox"
      aria-label="Search suggestions"
      className="absolute top-full left-0 right-0 z-9999 mt-1 overflow-hidden rounded-lg border border-brand-border bg-brand-card shadow-xl shadow-black/30"
    >
      {!q && (
        <div className="max-h-[420px] overflow-y-auto no-scrollbar py-2">
          {recent.length > 0 && (
            <>
              <div className="flex items-center justify-between px-4 pb-1 pt-1">
                <p className="text-custom-xs uppercase tracking-wide text-brand-muted">Recent searches</p>
                <button
                  type="button"
                  onClick={() => {
                    clearRecentSearches();
                    setRecent([]);
                  }}
                  className="text-custom-xs text-brand-accent hover:underline"
                >
                  Clear
                </button>
              </div>
              {recent.map((r, i) => (
                <button key={r} type="button" onClick={() => go(`/shop?q=${encodeURIComponent(r)}`, r)} className={`${rowClass(i === activeIndex)} w-full text-left`}>
                  <ClockIcon />
                  <span className="truncate text-sm">{r}</span>
                </button>
              ))}
              <div className="h-2" />
            </>
          )}
          {popularChips || (recent.length === 0 && <p className="px-4 py-4 text-sm text-brand-muted">Type to search products.</p>)}
        </div>
      )}

      {q && loading && suggestions.length === 0 && (
        <div className="flex items-center justify-center gap-1 py-5" aria-label="Searching">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-accent [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-accent [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-accent [animation-delay:300ms]" />
        </div>
      )}

      {q && !loading && suggestions.length === 0 && (
        <div className="py-4">
          <p className="px-4 text-sm text-white">No products found for &ldquo;{q}&rdquo;</p>
          <p className="mb-3 mt-1 px-4 text-custom-sm text-brand-muted">Check the spelling, try fewer or more general words, or browse a category.</p>
          {popularChips}
        </div>
      )}

      {q && suggestions.length > 0 && (
        <>
          <div className="max-h-[400px] overflow-y-auto no-scrollbar">
            {suggestions.map((item, i) => {
              const soldOut = item.stock !== undefined && item.total_stock !== undefined ? item.total_stock <= 0 : item.stock <= 0;
              const sale = Number(item.compare_price) > Number(item.effective_price);
              const meta = [item.category_name, item.brand].filter(Boolean).join(" · ");
              return (
                <Link
                  key={item.id}
                  href={`/shop/${item.slug}`}
                  onClick={() => {
                    addRecentSearch(q);
                    onClose();
                  }}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={rowClass(i === activeIndex)}
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-brand-surface">
                    {item.primary_image?.image ? (
                      <FallbackImage src={mediaPath(item.primary_image.image)} alt="" fill sizes="48px" fallbackLabel="" className="object-cover" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm"><Highlight text={item.name} term={q} /></span>
                    {meta && <span className="block truncate text-custom-xs text-brand-muted">{meta}</span>}
                  </span>
                  <span className="shrink-0 text-right">
                    {soldOut ? (
                      <span className="rounded border border-brand-border px-1.5 py-0.5 text-[11px] text-brand-muted">Out of stock</span>
                    ) : (
                      <>
                        <span className="block text-sm font-medium text-brand-accent">{formatPrice(item.effective_price ?? item.price)}</span>
                        {sale && <span className="block text-custom-xs text-brand-muted line-through">{formatPrice(item.compare_price)}</span>}
                      </>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
          <Link
            href={`/shop?q=${encodeURIComponent(q)}`}
            onClick={() => {
              addRecentSearch(q);
              onClose();
            }}
            className="block border-t border-brand-border py-3 text-center text-sm text-brand-accent ease-out duration-150 hover:bg-brand-hover"
          >
            View all results for &ldquo;{q}&rdquo;
          </Link>
        </>
      )}
    </div>
  );
};

export default SearchSuggestions;
