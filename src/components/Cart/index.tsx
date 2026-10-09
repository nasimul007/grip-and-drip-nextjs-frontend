"use client";
import React from "react";
import Link from "next/link";
import OrderSummary from "./OrderSummary";
import SingleItem from "./SingleItem";
import Breadcrumb from "../Common/Breadcrumb";
import CartEmpty from "../Common/CartEmpty";
import { useAppSelector } from "@/redux/store";
import { lineKeyOf, selectCartCount, selectTotalPrice } from "@/redux/features/cart-slice";
import { useCart } from "@/lib/useCart";

const Cart = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const count = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectTotalPrice);
  const { clearCart } = useCart();

  return (
    <>
      <Breadcrumb items={[{ name: "Cart" }]} />
      <section className="bg-brand-dark pt-4 pb-6 lg:pb-8">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h1 className="text-xl font-semibold text-white">
              Shopping cart
              {count > 0 && <span className="ml-2 text-base font-normal text-brand-muted">({count} {count === 1 ? "item" : "items"})</span>}
            </h1>
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Remove all items from your cart?")) clearCart();
                }}
                className="text-sm text-brand-muted hover:text-red"
              >
                Clear cart
              </button>
            )}
          </div>

          {cartItems.length > 0 ? (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <div className="rounded-lg border border-brand-border bg-brand-card">
                  <div className="hidden sm:grid grid-cols-[88px_1fr_96px_112px_88px_32px] gap-x-3 border-b border-brand-border px-4 py-2 text-custom-xs uppercase tracking-wide text-brand-muted">
                    <span className="col-span-2">Product</span>
                    <span className="text-right">Price</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-right">Total</span>
                    <span />
                  </div>
                  <ul>
                    {cartItems.map((item) => (
                      <SingleItem item={item} key={lineKeyOf(item)} />
                    ))}
                  </ul>
                </div>
                <Link href="/shop" className="mt-3 inline-block text-sm text-brand-accent hover:underline">
                  ← Continue shopping
                </Link>
              </div>

              <div className="w-full lg:w-[340px] lg:shrink-0">
                <OrderSummary cartItems={cartItems} subtotal={subtotal} />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-brand-border bg-brand-card">
              <CartEmpty />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Cart;
