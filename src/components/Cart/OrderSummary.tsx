"use client";
import React, { useState } from "react";
import Link from "next/link";
import type { ReduxCartItem } from "@/redux/features/cart-slice";
import { api } from "@/lib/api";

type Props = {
  cartItems: ReduxCartItem[];
  subtotal: number;
};

const OrderSummary = ({ cartItems, subtotal }: Props) => {
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);

  const total = subtotal - discount;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="lg:sticky lg:top-[110px]">
      <div className="bg-white shadow-1 rounded-[10px] border border-gray-3">
        <div className="border-b border-gray-3 py-3 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Order Summary</h3>
        </div>

        <div className="pt-1.5 pb-8.5 px-4 sm:px-8.5">
          <div className="flex items-center justify-between py-3 border-b border-gray-3">
            <div>
              <p className="text-dark">Subtotal ({itemCount} items)</p>
            </div>
            <div>
              <p className="text-dark text-right">
                ৳{subtotal.toFixed(2)}
              </p>
            </div>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between py-3 border-b border-gray-3">
              <div>
                <p className="text-dark">Discount</p>
              </div>
              <div>
                <p className="text-green text-right">
                  -৳{discount.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div className="pt-5">
            <form onSubmit={handleApplyCoupon} className="flex gap-3">
              <input
                type="text"
                name="coupon"
                id="cart-coupon"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
              <button
                type="submit"
                disabled={applying}
                className="inline-flex font-medium text-white bg-blue py-2.5 px-5 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50"
              >
                Apply
              </button>
            </form>
            {couponError && (
              <p className="text-red text-custom-sm mt-2.5">
                {couponError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-dark">Total</p>
            </div>
            <div>
              <p className="font-medium text-lg text-dark text-right">
                ৳{total.toFixed(2)}
              </p>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;