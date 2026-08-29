"use client";
import { useDispatch } from "react-redux";
import { clearTokens } from "@/lib/api";
import { logout } from "@/redux/features/auth-slice";
import { removeAllItemsFromCart, persistGuestCart } from "@/redux/features/cart-slice";

export function useLogout() {
  const dispatch = useDispatch();
  return () => {
    clearTokens();
    dispatch(logout());
    dispatch(removeAllItemsFromCart());
    persistGuestCart([]);
  };
}
