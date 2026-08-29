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

  const fetchCartRef = useRef(fetchCart);
  fetchCartRef.current = fetchCart;
  const syncGuestCartRef = useRef(syncGuestCart);
  syncGuestCartRef.current = syncGuestCart;

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCartRef.current();
    if (!didSync.current) {
      didSync.current = true;
      syncGuestCartRef.current();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (wasAuthed.current && !isAuthenticated) {
      dispatch(removeAllItemsFromCart());
      persistGuestCart([]);
    }
    wasAuthed.current = isAuthenticated;
  }, [isAuthenticated, dispatch]);

  return null;
}
