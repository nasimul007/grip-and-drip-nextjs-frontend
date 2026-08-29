"use client";
import { useCallback, useRef } from "react";
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
import type { Cart as APICart, ProductDetail } from "@/lib/types";

export type AddItemPayload = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  stock?: number;
  slug?: string;
  variantName?: string;
  variantId?: number;
  imgs?: ReduxCartItem["imgs"];
};

type ResolvableItem = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  slug?: string;
  stock?: number;
  imgs?: ReduxCartItem["imgs"];
};

export async function resolveAddableItem(
  item: ResolvableItem
): Promise<AddItemPayload | null> {
  const fallback: AddItemPayload = { ...item, quantity: 1 };

  if (!item.slug) {
    return item.stock && item.stock > 0 ? fallback : null;
  }

  try {
    const detail = await api.get<ProductDetail>(`/api/products/${item.slug}/`);
    const variants = detail.variants || [];

    if (variants.length > 0) {
      const inStock = variants.find((v) => v.stock > 0);
      const variant = inStock || variants[0];
      if (variant && (variant.stock > 0 || Number(detail.stock) > 0)) {
        return {
          id: detail.id,
          title: detail.name,
          price: Number(detail.compare_price) || Number(detail.effective_price),
          discountedPrice:
            variant.price_override ?? Number(detail.effective_price),
          quantity: 1,
          stock: variant.stock,
          slug: detail.slug,
          variantName: variant.name,
          variantId: variant.id,
          imgs: item.imgs,
        };
      }
      return null;
    }

    if (Number(detail.stock) > 0) {
      return { ...fallback, stock: detail.stock };
    }
    return null;
  } catch {
    return fallback;
  }
}

function toCartImage(path: string | null | undefined): string | null {
  if (!path || typeof path !== "string") return null;
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/media/${path}`;
}

function mapAPICartItemToRedux(
  item: import("@/lib/types").CartItem
): ReduxCartItem {
  const anyItem = item as any;
  const image = toCartImage(item.product_image);
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
      thumbnails: image ? [image] : [],
      previews: image ? [image] : [],
    },
  };
}

export function useCart() {
  const dispatch = useDispatch();
  const isAuthenticated = useAppSelector(
    (state) => state.authReducer.isAuthenticated
  );
  const items = useAppSelector((state) => state.cartReducer.items);

  const isAuthedRef = useRef(isAuthenticated);
  isAuthedRef.current = isAuthenticated;

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const cart: APICart = await api.get("/api/cart/");
      if (!isAuthedRef.current) return;
      dispatch(setCartItems(cart.items.map(mapAPICartItemToRedux)));
    } catch {
      /* not logged in or error */
    }
  }, [isAuthenticated, dispatch]);

  const addItem = useCallback(
    async (item: AddItemPayload) => {
      const lineKey = makeLineKey(item);
      const cartItem: ReduxCartItem = { ...item, lineKey };
      if (isAuthenticated) {
        try {
          await api.post("/api/cart/add/", {
            product_id: item.id,
            quantity: item.quantity,
            variant_id: item.variantId,
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
    if (!isAuthenticated || items.length === 0) {
      persistGuestCart([]);
      return;
    }
    try {
      for (const item of items) {
        await api.post("/api/cart/add/", {
          product_id: item.id,
          quantity: item.quantity,
          variant_id: item.variantId,
        });
      }
      await fetchCart();
    } catch {}
    persistGuestCart([]);
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
