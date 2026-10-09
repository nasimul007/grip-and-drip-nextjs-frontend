"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { Product } from "@/types/product";
import { AppDispatch } from "@/redux/store";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { api } from "@/lib/api";
import { mapProductDetailForDisplay } from "@/lib/mappers";
import { useCart, resolveAddableItem } from "@/lib/useCart";
import { discountPercent, formatPrice } from "@/lib/format";
import WishlistButton from "@/components/Common/WishlistButton";
import { CartIcon, SearchIcon } from "@/components/Common/icons";
import type { ProductDetail } from "@/lib/types";

const ProductItem = ({ item, priority = false }: { item: Product; priority?: boolean }) => {
  const { openModal } = useModalContext();
  const { addItem } = useCart();
  const dispatch = useDispatch<AppDispatch>();
  const [adding, setAdding] = useState(false);

  const href = item.slug ? `/shop/${item.slug}` : "/shop";
  const image = item.imgs?.previews?.[0]?.trim();
  const outOfStock = item.stock !== undefined && item.stock <= 0;
  const off = discountPercent(Number(item.price), Number(item.discountedPrice));

  const handleQuickView = async () => {
    openModal();
    try {
      const detail = await api.get<ProductDetail>(`/api/products/${item.slug}/`);
      dispatch(updateQuickView(mapProductDetailForDisplay(detail)));
    } catch {
      dispatch(updateQuickView({ ...item }));
    }
  };

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      const payload = await resolveAddableItem(item);
      if (payload) addItem(payload);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="group flex flex-col h-full bg-brand-card border border-brand-border rounded-lg overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-brand-surface">
        <Link
          href={href}
          className="block w-full h-full"
          onClick={() => dispatch(updateproductDetails({ ...item }))}
          tabIndex={-1}
          aria-hidden="true"
        >
          {image ? (
            <Image
              src={image}
              alt={item.title}
              fill
              priority={priority}
              className={`object-cover transition-transform duration-300 group-hover:scale-105 ${outOfStock ? "opacity-50" : ""}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-brand-muted text-sm">
              No image
            </span>
          )}
        </Link>

        {off > 0 && !outOfStock && (
          <span className="absolute left-2 top-2 rounded bg-brand-accent px-1.5 py-0.5 text-2xs sm:text-custom-xs font-semibold text-brand-dark">
            -{off}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded bg-brand-dark/90 border border-brand-border px-1.5 py-0.5 text-2xs sm:text-custom-xs font-medium text-white">
            Out of stock
          </span>
        )}

        <div className="absolute right-2 top-2 flex flex-col gap-2 lg:opacity-0 lg:translate-x-2 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 lg:group-focus-within:opacity-100 lg:group-focus-within:translate-x-0 transition">
          <WishlistButton item={item} className="!w-8 !h-8" />
          <button
            type="button"
            onClick={handleQuickView}
            aria-label={`Quick view ${item.title}`}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-[5px] border border-brand-border bg-brand-card text-white hover:text-brand-accent hover:border-brand-accent"
          >
            <SearchIcon size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-3 sm:p-4">
        <h3 className="text-custom-sm sm:text-base font-medium text-white leading-snug line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem] mb-2">
          <Link
            href={href}
            title={item.title}
            onClick={() => dispatch(updateproductDetails({ ...item }))}
            className="hover:text-brand-accent"
          >
            {item.title}
          </Link>
        </h3>

        <p className="flex flex-wrap items-baseline gap-x-2 mb-3">
          <span className="text-white font-semibold sm:text-lg">{formatPrice(item.discountedPrice)}</span>
          {Number(item.price) > Number(item.discountedPrice) && (
            <span className="text-custom-xs sm:text-custom-sm text-brand-muted line-through">
              <span className="sr-only">Regular price </span>
              {formatPrice(item.price)}
            </span>
          )}
        </p>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock || adding}
          className="mt-auto flex items-center justify-center gap-2 w-full rounded-md border border-brand-accent/60 py-2 text-custom-sm font-medium text-brand-accent hover:bg-brand-accent hover:text-brand-dark disabled:border-brand-border disabled:text-brand-muted disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
        >
          <CartIcon size={16} />
          {outOfStock ? "Out of stock" : adding ? "Adding…" : "Add to cart"}
        </button>
      </div>
    </article>
  );
};

export default ProductItem;
