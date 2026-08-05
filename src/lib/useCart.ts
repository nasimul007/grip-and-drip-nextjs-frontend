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
  makeLineKey,
  type ReduxCartItem,
} from "@/redux/features/cart-slice";
import { api } from "@/lib/api";
import type { Cart as APICart } from "@/lib/types";
import { buildImageUrl } from "@/lib/api";

function mapAPICartItemToRedux(
  item: import("@/lib/types").CartItem
): ReduxCartItem {
  const anyItem = item as any;
  return {
    id: item.product_id,
    cartItemId: item.id,
    lineKey: String(item.id),
    title: item.product_name,
    price: Number(item.price),
    discountedPrice: Number(item.price),
    quantity: item.quantity,
    variantName: item.variant_name || undefined,
    slug: item.product_slug,
    stock: anyItem.stock != null ? Number(anyItem.stock) : undefined,
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
      stock?: number;
      slug?: string;
      variantName?: string;
      imgs?: ReduxCartItem["imgs"];
    }) => {
      if (item.stock !== undefined && Number(item.stock) === 0) return;
      const lineKey = makeLineKey(item);
      const cartItem: ReduxCartItem = { ...item, lineKey };
      if (isAuthenticated) {
        try {
          await api.post("/api/cart/add/", {
            product_id: item.id,
            quantity: item.quantity,
          });
          await fetchCart();
        } catch {
          /* fallback to local */
          dispatch(addItemToCart(cartItem));
        }
      } else {
        dispatch(addItemToCart(cartItem));
        const existingItem = items.find(
          (i) => (i.lineKey || makeLineKey(i)) === lineKey
        );
        const nextItems = existingItem
          ? items.map((i) =>
              (i.lineKey || makeLineKey(i)) === lineKey
                ? {
                    ...i,
                    quantity: Math.min(
                      i.quantity + item.quantity,
                      i.stock ?? Infinity
                    ),
                  }
                : i
            )
          : [...items, cartItem];
        persistGuestCart(nextItems);
      }
    },
    [isAuthenticated, dispatch, fetchCart, items]
  );

  const updateQuantity = useCallback(
    async (lineKey: string, quantity: number) => {
      const match = items.find((i) => (i.lineKey || makeLineKey(i)) === lineKey);
      if (isAuthenticated) {
        try {
          if (match?.cartItemId) {
            await api.patch(`/api/cart/items/${match.cartItemId}/`, {
              quantity,
            });
          }
          await fetchCart();
        } catch {
          dispatch(updateCartItemQuantity({ lineKey, quantity }));
        }
      } else {
        dispatch(updateCartItemQuantity({ lineKey, quantity }));
        persistGuestCart(
          items.map((i) =>
            (i.lineKey || makeLineKey(i)) === lineKey ? { ...i, quantity } : i
          )
        );
      }
    },
    [isAuthenticated, dispatch, fetchCart, items]
  );

  const removeItem = useCallback(
    async (lineKey: string) => {
      const match = items.find((i) => (i.lineKey || makeLineKey(i)) === lineKey);
      if (isAuthenticated) {
        try {
          if (match?.cartItemId) {
            await api.delete(`/api/cart/items/${match.cartItemId}/`);
          }
          await fetchCart();
        } catch {
          dispatch(removeItemFromCart(lineKey));
        }
      } else {
        dispatch(removeItemFromCart(lineKey));
        persistGuestCart(
          items.filter((i) => (i.lineKey || makeLineKey(i)) !== lineKey)
        );
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
