"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadLocalCart, setCartItems } from "@/redux/features/cart-slice";
import { loadLocalWishlist, setWishlistItems } from "@/redux/features/wishlist-slice";

/** Loads the guest cart and wishlist from localStorage once, after hydration. */
export default function StoreHydrator() {
  const dispatch = useDispatch();
  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      dispatch(setCartItems(loadLocalCart()));
    }
    dispatch(setWishlistItems(loadLocalWishlist()));
  }, [dispatch]);
  return null;
}
