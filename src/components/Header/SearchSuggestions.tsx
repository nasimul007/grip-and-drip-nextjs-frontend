"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { PaginatedResponse, ProductListItem } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

type SearchSuggestionsProps = {
  query: string;
  isOpen: boolean;
  onClose: () => void;
};

const SearchSuggestions = ({ query, isOpen, onClose }: SearchSuggestionsProps) => {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("search", query.trim());
      params.set("page_size", "5");

      api
        .get<PaginatedResponse<ProductListItem>>(
          `/api/products/?${params.toString()}`
        )
        .then((data) => {
          setSuggestions(data.results);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || !suggestions.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        const item = suggestions[activeIndex];
        router.push(`/shop/${item.slug}`);
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [isOpen, suggestions, activeIndex, router, onClose]
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  if (!isOpen || !query.trim()) return null;

  return (
    <div
      ref={listRef}
      onKeyDown={handleKeyDown}
      className="absolute top-full left-0 right-0 z-9999 mt-1 bg-brand-card border border-brand-border rounded-lg shadow-xl shadow-black/30 overflow-hidden"
    >
      {loading && (
        <div className="flex items-center justify-center py-4 gap-1">
          <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      )}

      {!loading && suggestions.length === 0 && query.trim() && (
        <div className="py-6 px-4 text-center text-brand-muted text-sm">
          No products found for &ldquo;{query}&rdquo;
        </div>
      )}

      {suggestions.length > 0 && (
        <>
          <div className="max-h-[360px] overflow-y-auto no-scrollbar">
            {suggestions.map((item, i) => (
              <Link
                key={item.id}
                href={`/shop/${item.slug}`}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 ease-out duration-150 ${
                  i === activeIndex
                    ? "bg-brand-hover text-white"
                    : "text-brand-muted hover:bg-brand-hover hover:text-white"
                }`}
              >
                <div className="relative shrink-0 w-10 h-10 rounded overflow-hidden bg-gray-3">
                  <div className="absolute inset-1 bg-white/[0.04] blur-xl rounded-full pointer-events-none" />
                  {item.primary_image?.image ? (
                    <Image
                      src={item.primary_image.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-dark flex items-center justify-center text-[8px] text-brand-muted">
                      N/A
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{item.name}</p>
                  <p className="text-xs text-brand-accent">
                    ৳{item.effective_price ?? item.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href={`/shop-with-sidebar?q=${encodeURIComponent(query)}`}
            onClick={onClose}
            className="block text-center text-sm text-brand-accent py-3 border-t border-brand-border hover:bg-brand-hover ease-out duration-150"
          >
            View all results
          </Link>
        </>
      )}
    </div>
  );
};

export default SearchSuggestions;
