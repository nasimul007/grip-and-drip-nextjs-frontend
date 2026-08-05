"use client";
import React, { useState } from "react";
import Link from "next/link";
import type { ReduxCartItem } from "@/redux/features/cart-slice";
import { api } from "@/lib/api";

type Props = {
  cartItems: ReduxCartItem[];
  subtotal: number;
  shippingCost?: number;
  shippingLabel?: string;
  showProceedLink?: boolean;
  sticky?: boolean;
};

const OrderSummary = ({
  cartItems,
  subtotal,
  shippingCost,
  shippingLabel,
  showProceedLink = true,
  sticky = true,
}: Props) => {
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);

  const total = subtotal - discount + (shippingCost ?? 0);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;

    setApplying(true);
    setCouponError("");
    try {
      const res = await api.post<{ discount: number }>("/api/coupons/validate/", {
        code,
        subtotal,
      });
      setDiscount(Number(res.discount) || 0);
    } catch {
      setDiscount(0);
      setCouponError("Sorry, this coupon is not valid.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className={sticky ? "lg:sticky lg:top-[110px]" : ""}>
      <div className="bg-brand-card rounded-[10px] border border-brand-border">
        <div className="border-b border-brand-border py-3 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-white">Order Summary</h3>
        </div>

        <div className="pt-1.5 pb-8.5 px-4 sm:px-8.5">
          <div className="flex items-center justify-between py-3 border-b border-brand-border">
            <div>
              <p className="text-white">Subtotal ({itemCount} items)</p>
            </div>
            <div>
              <p className="text-white text-right">
                ৳{subtotal.toFixed(2)}
              </p>
            </div>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between py-3 border-b border-brand-border">
              <div>
                <p className="text-white">Discount</p>
              </div>
              <div>
                <p className="text-green text-right">
                  -৳{discount.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {shippingCost !== undefined && (
            <div className="flex items-center justify-between py-3 border-b border-brand-border">
              <div>
                <p className="text-white">Shipping Fee</p>
              </div>
              <div>
                <p className="text-white text-right">
                  {shippingCost === 0 ? "Free" : `৳${shippingCost.toFixed(2)}`}
                </p>
                {shippingLabel && (
                  <p className="text-custom-xs text-brand-muted text-right">
                    {shippingLabel}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="pt-5">
            <div className="flex gap-3">
              <input
                type="text"
                name="coupon"
                id="cart-coupon"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyCoupon();
                  }
                }}
                className="rounded-md border border-brand-border bg-brand-surface placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-accent/20"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={applying}
                className="inline-flex font-medium text-white bg-brand-accent py-2.5 px-5 rounded-md ease-out duration-200 hover:bg-brand-hover disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {couponError && (
              <p className="text-red text-custom-sm mt-2.5">
                {couponError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-white">Total</p>
            </div>
            <div>
              <p className="font-medium text-lg text-white text-right">
                ৳{total.toFixed(2)}
              </p>
            </div>
          </div>

          {showProceedLink && (
            <Link
              href="/checkout"
              className="w-full flex justify-center font-medium text-white bg-brand-accent py-3 px-6 rounded-md ease-out duration-200 hover:bg-brand-hover mt-7.5"
            >
              Proceed to Checkout
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
