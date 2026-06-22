"use client";
import { useEffect, useRef } from "react";
import { useAppSelector } from "@/redux/store";
import { useCart } from "@/lib/useCart";

export default function CartInit() {
  const isAuthenticated = useAppSelector(
    (state) => state.authReducer.isAuthenticated
  );
  const { fetchCart, syncGuestCart } = useCart();
  const prevAuth = useRef(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !prevAuth.current) {
      syncGuestCart();
    }
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated, syncGuestCart]);

  return null;
}
