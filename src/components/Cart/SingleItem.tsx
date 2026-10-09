"use client";
import React from "react";
import Link from "next/link";
import { lineKeyOf, type ReduxCartItem } from "@/redux/features/cart-slice";
import { useCart } from "@/lib/useCart";
import { formatPrice } from "@/lib/format";
import FallbackImage from "@/components/Common/FallbackImage";
import QtyStepper from "@/components/Common/QtyStepper";
import { CloseIcon } from "@/components/Common/icons";

/** One cart line. Desktop: product | price | quantity | total | remove. Phones: compact card. */
const SingleItem = ({ item }: { item: ReduxCartItem }) => {
  const { removeItem, updateQuantity } = useCart();
  const lineKey = lineKeyOf(item);
  const href = item.slug ? `/shop/${item.slug}` : "/shop";
  const thumb = item.imgs?.thumbnails?.[0];
  const discounted = item.price > item.discountedPrice;
  const atMax = item.stock !== undefined && item.stock > 0 && item.quantity >= item.stock;
  const lineTotal = item.discountedPrice * item.quantity;

  return (
    <li className="grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr_96px_112px_88px_32px] items-center gap-x-3 gap-y-2 px-3 py-3 sm:px-4 border-b border-brand-border last:border-b-0">
      <Link href={href} className="relative h-[72px] w-[72px] sm:h-[88px] sm:w-[88px] overflow-hidden rounded-md bg-brand-surface row-span-2 sm:row-span-1" tabIndex={-1} aria-hidden="true">
        {thumb ? (
          <FallbackImage src={thumb} alt="" fill sizes="88px" fallbackLabel="" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-brand-muted">No image</span>
        )}
      </Link>

      <div className="min-w-0">
        <h3 className="text-sm font-medium leading-snug text-white line-clamp-2">
          <Link href={href} className="hover:text-brand-accent">{item.title}</Link>
        </h3>
        {item.variantName && <p className="text-custom-xs text-brand-muted mt-0.5">{item.variantName}</p>}
        {atMax && <p className="text-custom-xs text-brand-muted mt-0.5">Maximum available: {item.stock}</p>}
        {/* phones: price under the title */}
        <p className="sm:hidden mt-1 text-sm text-white">
          {formatPrice(item.discountedPrice)}
          {discounted && <span className="ml-2 text-custom-xs text-brand-muted line-through">{formatPrice(item.price)}</span>}
        </p>
      </div>

      {/* unit price (desktop) */}
      <div className="hidden sm:block text-right text-sm">
        <p className="text-white">{formatPrice(item.discountedPrice)}</p>
        {discounted && <p className="text-custom-xs text-brand-muted line-through">{formatPrice(item.price)}</p>}
      </div>

      <div className="col-start-2 sm:col-start-auto flex items-center justify-between sm:justify-center gap-3">
        <QtyStepper quantity={item.quantity} max={item.stock} label={item.title} onChange={(q) => updateQuantity(lineKey, q)} />
        <p className="sm:hidden text-sm font-semibold text-white">{formatPrice(lineTotal)}</p>
      </div>

      <p className="hidden sm:block text-right text-sm font-semibold text-white">{formatPrice(lineTotal)}</p>

      <button
        type="button"
        onClick={() => removeItem(lineKey)}
        aria-label={`Remove ${item.title} from cart`}
        className="hidden sm:flex items-center justify-center h-8 w-8 rounded-md text-brand-muted hover:text-red hover:bg-brand-surface"
      >
        <CloseIcon size={18} />
      </button>
      {/* phones: remove sits with the card */}
      <button
        type="button"
        onClick={() => removeItem(lineKey)}
        aria-label={`Remove ${item.title} from cart`}
        className="sm:hidden col-start-2 justify-self-start text-custom-xs text-brand-muted hover:text-red"
      >
        Remove
      </button>
    </li>
  );
};

export default SingleItem;
