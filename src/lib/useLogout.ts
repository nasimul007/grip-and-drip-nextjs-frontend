"use client";
import { useDispatch } from "react-redux";
import { revokeTokens } from "@/lib/api";
import { logout } from "@/redux/features/auth-slice";
import { removeAllItemsFromCart, clearLocalCart } from "@/redux/features/cart-slice";

export function useLogout() {
  const dispatch = useDispatch();
  return () => {
    revokeTokens();
    dispatch(logout());
    dispatch(removeAllItemsFromCart());
    clearLocalCart();
  };
}
