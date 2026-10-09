import React from "react";
import OrderSuccess from "@/components/OrderSuccess";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Order placed",
  description: "Thank you for your order.",
  alternates: { canonical: "/order-success" },
  robots: { index: false, follow: true },
};

const OrderSuccessPage = () => {
  return (
    <main>
      <OrderSuccess />
    </main>
  );
};

export default OrderSuccessPage;