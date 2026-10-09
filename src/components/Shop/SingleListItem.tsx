"use client";
import React from "react";

import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import WishlistButton from "@/components/Common/WishlistButton";
import { useCart } from "@/lib/useCart";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import { discountPercent, formatPrice } from "@/lib/format";
import { SearchIcon } from "@/components/Common/icons";
import Image from "next/image";
import { api } from "@/lib/api";
import { mapProductDetailForDisplay } from "@/lib/mappers";
import type { ProductDetail } from "@/lib/types";

const SingleListItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();
  const { addResolved } = useCart();

  // update the QuickView state with full product detail
  const handleQuickViewUpdate = async () => {
    try {
      const detail = await api.get<ProductDetail>(`/api/products/${item.slug}/`);
      dispatch(updateQuickView(mapProductDetailForDisplay(detail)));
    } catch (err) {
      console.error("Failed to fetch product detail:", err);
      dispatch(updateQuickView({ ...item }));
    }
  };

  // add to cart
  const handleAddToCart = async () => {
    await addResolved(item);
  };

  const href = item.slug ? `/shop/${item.slug}` : "/shop";
  const image = item.imgs?.previews?.[0]?.trim();
  const outOfStock = item.stock !== undefined && item.stock <= 0;
  const off = discountPercent(Number(item.price), Number(item.discountedPrice));

  return (
    <article className="group flex rounded-lg bg-brand-card border border-brand-border overflow-hidden">
      <Link href={href} className="relative block w-[140px] sm:w-[220px] aspect-square shrink-0 bg-brand-surface" tabIndex={-1} aria-hidden="true">
        {image ? (
          <Image src={image} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="220px" />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-brand-muted text-sm">No image</span>
        )}
        {off > 0 && !outOfStock && (
          <span className="absolute left-2 top-2 rounded bg-brand-accent px-1.5 py-0.5 text-custom-xs font-semibold text-brand-dark">-{off}%</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-7.5">
        <div className="min-w-0">
          <h3 className="font-medium text-white line-clamp-2 mb-1.5">
            <Link href={href} title={item.title} className="hover:text-brand-accent">{item.title}</Link>
          </h3>
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-white font-semibold text-lg">{formatPrice(item.discountedPrice)}</span>
            {Number(item.price) > Number(item.discountedPrice) && (
              <span className="text-brand-muted line-through text-custom-sm">
                <span className="sr-only">Regular price </span>
                {formatPrice(item.price)}
              </span>
            )}
          </p>
          {outOfStock && <p className="text-red text-custom-sm mt-1">Out of stock</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleAddToCart()}
            disabled={outOfStock}
            className="inline-flex font-medium text-custom-sm py-2 px-5 rounded-md bg-brand-accent text-brand-dark hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add to cart
          </button>
          <button
            type="button"
            onClick={() => {
              openModal();
              handleQuickViewUpdate();
            }}
            aria-label={`Quick view ${item.title}`}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-[5px] border border-brand-border text-white bg-brand-card hover:text-brand-accent"
          >
            <SearchIcon size={16} />
          </button>
          <WishlistButton item={item} />
        </div>
      </div>
    </article>
  );
};

export default SingleListItem;
