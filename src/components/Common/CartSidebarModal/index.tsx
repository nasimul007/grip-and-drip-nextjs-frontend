"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { lineKeyOf, selectCartCount, selectTotalPrice } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import { formatPrice } from "@/lib/format";
import SingleItem from "./SingleItem";
import EmptyCart from "./EmptyCart";
import FreeShippingProgress from "@/components/Common/FreeShippingProgress";
import { CloseIcon } from "@/components/Common/icons";

const CartSidebarModal = () => {
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const count = useAppSelector(selectCartCount);
  const totalPrice = useAppSelector(selectTotalPrice);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isCartModalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCartModal();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // lock page scroll while open
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isCartModalOpen, closeCartModal]);

  return (
    <div
      className={`fixed inset-0 z-99999 ${isCartModalOpen ? "visible" : "invisible delay-300"}`}
      aria-hidden={!isCartModalOpen}
      {...(!isCartModalOpen ? { inert: true } : {})}
    >
      <div
        className={`absolute inset-0 bg-[#000000CC] transition-opacity duration-300 ${isCartModalOpen ? "opacity-100" : "opacity-0"}`}
        onClick={closeCartModal}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[400px] flex-col bg-brand-card shadow-1 transition-transform duration-300 ${
          isCartModalOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-brand-border px-4 py-3">
          <h2 className="text-base font-semibold text-white">
            Shopping cart{count > 0 && <span className="ml-1.5 text-brand-muted font-normal">({count})</span>}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCartModal}
            aria-label="Close cart"
            className="rounded-md p-1.5 text-brand-muted hover:text-white"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 no-scrollbar">
          {cartItems.length > 0 ? (
            <ul>
              {cartItems.map((item) => (
                <SingleItem key={lineKeyOf(item)} item={item} onNavigate={closeCartModal} />
              ))}
            </ul>
          ) : (
            <EmptyCart />
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="shrink-0 border-t border-brand-border px-4 py-3 flex flex-col gap-3">
            <FreeShippingProgress subtotal={totalPrice} />
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-muted">Subtotal</span>
              <span className="text-lg font-semibold text-white">{formatPrice(totalPrice)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/cart"
                onClick={closeCartModal}
                className="flex h-10 items-center justify-center rounded-md border border-brand-border text-sm font-medium text-white hover:border-brand-accent"
              >
                View cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeCartModal}
                className="flex h-10 items-center justify-center rounded-md bg-brand-accent text-sm font-medium text-brand-dark hover:bg-brand-hover"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartSidebarModal;
