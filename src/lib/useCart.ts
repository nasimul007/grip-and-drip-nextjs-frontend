"use client";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/store";
import {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  setCartItems,
  persistGuestCart,
  type ReduxCartItem,
} from "@/redux/features/cart-slice";
import { api } from "@/lib/api";
import type { Cart as APICart } from "@/lib/types";
import { buildImageUrl } from "@/lib/api";

function mapAPICartItemToRedux(
  item: import("@/lib/types").CartItem
): ReduxCartItem {
  return {
    id: item.product_id,
    cartItemId: item.id,
    title: item.product_name,
    price: item.price,
    discountedPrice: item.price,
    quantity: item.quantity,
    imgs: {
      thumbnails: item.product_image ? [buildImageUrl(item.product_image)] : [],
      previews: item.product_image ? [buildImageUrl(item.product_image)] : [],
    },
  };
}

export function useCart() {
  const dispatch = useDispatch();
  const isAuthenticated = useAppSelector(
    (state) => state.authReducer.isAuthenticated
  );
  const items = useAppSelector((state) => state.cartReducer.items);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const cart: APICart = await api.get("/api/cart/");
      dispatch(setCartItems(cart.items.map(mapAPICartItemToRedux)));
    } catch {
      /* not logged in or error */
    }
  }, [isAuthenticated, dispatch]);

  const addItem = useCallback(
    async (item: {
      id: number;
      title: string;
      price: number;
      discountedPrice: number;
      quantity: number;
      imgs?: ReduxCartItem["imgs"];
    }) => {
      if (isAuthenticated) {
        try {
          await api.post("/api/cart/add/", {
            product_id: item.id,
            quantity: item.quantity,
          });
          await fetchCart();
        } catch {
          /* fallback to local */
          dispatch(addItemToCart(item));
        }
      } else {
        dispatch(addItemToCart(item));
        persistGuestCart([...items, item as ReduxCartItem]);
      }
    },
    [isAuthenticated, dispatch, fetchCart, items]
  );

  const updateQuantity = useCallback(
    async (id: number, quantity: number) => {
      if (isAuthenticated) {
        try {
          const match = items.find(
            (i) => i.cartItemId === id || i.id === id
          );
          if (match?.cartItemId) {
            await api.patch(`/api/cart/items/${match.cartItemId}/`, {
              quantity,
            });
          }
          await fetchCart();
        } catch {
          dispatch(updateCartItemQuantity({ id, quantity }));
        }
      } else {
        dispatch(updateCartItemQuantity({ id, quantity }));
        persistGuestCart(
          items.map((i) =>
            i.id === id || i.cartItemId === id ? { ...i, quantity } : i
          )
        );
      }
    },
    [isAuthenticated, dispatch, fetchCart, items]
  );

  const removeItem = useCallback(
    async (id: number) => {
      if (isAuthenticated) {
        try {
          const match = items.find(
            (i) => i.cartItemId === id || i.id === id
          );
          if (match?.cartItemId) {
            await api.delete(`/api/cart/items/${match.cartItemId}/`);
          }
          await fetchCart();
        } catch {
          dispatch(removeItemFromCart(id));
        }
      } else {
        dispatch(removeItemFromCart(id));
        persistGuestCart(items.filter((i) => i.id !== id));
      }
    },
    [isAuthenticated, dispatch, fetchCart, items]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await api.post("/api/cart/clear/");
      } catch {}
    }
    dispatch(removeAllItemsFromCart());
    persistGuestCart([]);
  }, [isAuthenticated, dispatch]);

  const syncGuestCart = useCallback(async () => {
    if (!isAuthenticated || items.length === 0) return;
    try {
      for (const item of items) {
        await api.post("/api/cart/add/", {
          product_id: item.id,
          quantity: item.quantity,
        });
      }
      await fetchCart();
    } catch {}
  }, [isAuthenticated, items, fetchCart]);

  return {
    items,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    syncGuestCart,
  };
}
