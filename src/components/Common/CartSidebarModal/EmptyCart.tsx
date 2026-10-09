"use client";
import React from "react";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import CartEmpty from "@/components/Common/CartEmpty";

const EmptyCart = () => {
  const { closeCartModal } = useCartModalContext();
  return <CartEmpty compact onNavigate={closeCartModal} />;
};

export default EmptyCart;
