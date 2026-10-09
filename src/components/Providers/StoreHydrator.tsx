"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/store";
import { loadLocalCart, saveLocalCart, setCartItems } from "@/redux/features/cart-slice";
import { loadLocalWishlist, setWishlistItems } from "@/redux/features/wishlist-slice";

/**
 * Loads the guest cart and wishlist from localStorage once after hydration and
 * then keeps the guest cart saved. The store is the single source of truth:
 * every change (from any component) is persisted here, so quick consecutive
 * actions can never overwrite each other.
 */
export default function StoreHydrator() {
  const dispatch = useDispatch();
  const items = useAppSelector((s) => s.cartReducer.items);
  const isAuthenticated = useAppSelector((s) => s.authReducer.isAuthenticated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      dispatch(setCartItems(loadLocalCart()));
    }
    dispatch(setWishlistItems(loadLocalWishlist()));
    setReady(true);
  }, [dispatch]);

  useEffect(() => {
    // While a login token exists the store may be empty only because the server
    // cart has not loaded yet; never overwrite the saved guest cart (it is merged
    // into the server cart by CartInit).
    if (ready && !isAuthenticated && !localStorage.getItem("access_token")) saveLocalCart(items);
  }, [ready, isAuthenticated, items]);

  return null;
}
