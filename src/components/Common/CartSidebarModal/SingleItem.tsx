"use client";
import React from "react";
import Link from "next/link";
import { lineKeyOf, type ReduxCartItem } from "@/redux/features/cart-slice";
import { useCart } from "@/lib/useCart";
import { formatPrice } from "@/lib/format";
import FallbackImage from "@/components/Common/FallbackImage";
import QtyStepper from "@/components/Common/QtyStepper";
import { CloseIcon } from "@/components/Common/icons";

const SingleItem = ({ item, onNavigate }: { item: ReduxCartItem; onNavigate?: () => void }) => {
  const { removeItem, updateQuantity } = useCart();
  const lineKey = lineKeyOf(item);
  const href = item.slug ? `/shop/${item.slug}` : "/shop";
  const thumb = item.imgs?.thumbnails?.[0];

  return (
    <li className="flex gap-3 py-2.5 border-b border-brand-border last:border-b-0">
      <Link href={href} onClick={onNavigate} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-brand-surface" tabIndex={-1} aria-hidden="true">
        {thumb ? (
          <FallbackImage src={thumb} alt="" fill sizes="64px" fallbackLabel="" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-brand-muted">No image</span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug text-white line-clamp-2">
            <Link href={href} onClick={onNavigate} className="hover:text-brand-accent">
              {item.title}
            </Link>
          </h3>
          <button
            type="button"
            onClick={() => removeItem(lineKey)}
            aria-label={`Remove ${item.title} from cart`}
            className="-mr-1 -mt-0.5 p-1 text-brand-muted hover:text-red"
          >
            <CloseIcon size={16} />
          </button>
        </div>
        <p className="text-custom-xs text-brand-muted truncate">
          {item.variantName ? `${item.variantName} · ` : ""}
          {formatPrice(item.discountedPrice)}
          {item.quantity > 1 ? " each" : ""}
        </p>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <QtyStepper
            size="sm"
            quantity={item.quantity}
            max={item.stock}
            label={item.title}
            onChange={(q) => updateQuantity(lineKey, q)}
          />
          <p className="text-sm font-semibold text-white">{formatPrice(item.discountedPrice * item.quantity)}</p>
        </div>
      </div>
    </li>
  );
};

export default SingleItem;
