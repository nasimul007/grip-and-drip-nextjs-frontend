"use client";
import { useEffect, useRef } from "react";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { useCart } from "@/lib/useCart";
import { removeAllItemsFromCart, clearLocalCart } from "@/redux/features/cart-slice";

export default function CartInit() {
  const isAuthenticated = useAppSelector(
    (state) => state.authReducer.isAuthenticated
  );
  const dispatch = useDispatch();
  const { syncGuestCart } = useCart();
  const wasAuthed = useRef(false);

  const syncGuestCartRef = useRef(syncGuestCart);
  syncGuestCartRef.current = syncGuestCart;

  // On login (and on reload while logged in): merge any guest cart into the
  // server cart, then load the server cart.
  useEffect(() => {
    if (isAuthenticated) syncGuestCartRef.current();
  }, [isAuthenticated]);

  useEffect(() => {
    if (wasAuthed.current && !isAuthenticated) {
      dispatch(removeAllItemsFromCart());
      clearLocalCart();
    }
    wasAuthed.current = isAuthenticated;
  }, [isAuthenticated, dispatch]);

  return null;
}
