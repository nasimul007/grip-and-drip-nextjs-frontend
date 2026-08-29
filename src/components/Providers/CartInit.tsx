"use client";
import { useEffect, useRef } from "react";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { useCart } from "@/lib/useCart";
import {
  removeAllItemsFromCart,
  persistGuestCart,
} from "@/redux/features/cart-slice";

export default function CartInit() {
  const isAuthenticated = useAppSelector(
    (state) => state.authReducer.isAuthenticated
  );
  const dispatch = useDispatch();
  const { fetchCart, syncGuestCart } = useCart();
  const didSync = useRef(false);
  const wasAuthed = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCart();
    if (!didSync.current) {
      didSync.current = true;
      syncGuestCart();
    }
  }, [isAuthenticated, fetchCart, syncGuestCart]);

  useEffect(() => {
    if (wasAuthed.current && !isAuthenticated) {
      dispatch(removeAllItemsFromCart());
      persistGuestCart([]);
    }
    wasAuthed.current = isAuthenticated;
  }, [isAuthenticated, dispatch]);

  return null;
}
