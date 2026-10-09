import React from "react";
import Cart from "@/components/Cart";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shopping cart",
  description: "Review the items in your cart.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: true },
};

const CartPage = () => {
  return (
    <>
      <Cart />
    </>
  );
};

export default CartPage;
