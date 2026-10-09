import React from "react";
import Checkout from "@/components/Checkout";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order with cash on delivery, bKash or bank transfer.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: true },
};

const CheckoutPage = () => {
  return (
    <main>
      <Checkout />
    </main>
  );
};

export default CheckoutPage;
