"use client";
import { useCallback, useMemo } from "react";
import { useDispatch, useStore } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  setCartItems,
  clearLocalCart,
  loadLocalCart,
  lineKeyOf,
  makeLineKey,
  type ReduxCartItem,
} from "@/redux/features/cart-slice";
import { api } from "@/lib/api";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { notifyAdded, notifyCartError, notifyCartInfo } from "@/lib/cart-toast";
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

const DETAIL_TTL_MS = 60_000;
const detailCache = new Map<string, { at: number; detail: ProductDetail }>();

async function getDetail(slug: string): Promise<ProductDetail> {
  const hit = detailCache.get(slug);
  if (hit && Date.now() - hit.at < DETAIL_TTL_MS) return hit.detail;
  const detail = await api.get<ProductDetail>(`/api/products/${slug}/`);
  detailCache.set(slug, { at: Date.now(), detail });
  return detail;
}

export async function resolveAddableItem(
  item: ResolvableItem
): Promise<AddItemPayload | null> {
  const fallback: AddItemPayload = { ...item, quantity: 1 };

  if (!item.slug) {
    return item.stock && item.stock > 0 ? fallback : null;
  }

  try {
    const detail = await getDetail(item.slug);
    const variants = (detail.variants || []).filter((v) => v.is_active !== false);

    if (variants.length > 0) {
      const variant = variants.find((v) => v.stock > 0);
      if (!variant) return null;
      const unit = variant.price_override ?? Number(detail.effective_price);
      return {
        id: detail.id,
        title: detail.name,
        price: Math.max(Number(detail.compare_price) || 0, unit),
        discountedPrice: unit,
        quantity: 1,
        stock: variant.stock,
        slug: detail.slug,
        variantName: variant.name,
        variantId: variant.id,
        imgs: item.imgs,
      };
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

export function mapAPICartItemToRedux(item: import("@/lib/types").CartItem): ReduxCartItem {
  const image = toCartImage(item.product_image);
  const unit = Number(item.price);
  const compare = item.compare_price != null ? Number(item.compare_price) : null;
  return {
    id: item.product_id,
    cartItemId: item.id,
    lineKey: String(item.id),
    title: item.product_name,
    price: compare && compare > unit ? compare : unit,
    discountedPrice: unit,
    quantity: item.quantity,
    variantName: item.variant_name || undefined,
    variantId: item.variant_id ?? undefined,
    slug: item.product_slug,
    stock: item.stock != null ? Number(item.stock) : undefined,
    imgs: {
      thumbnails: image ? [image] : [],
      previews: image ? [image] : [],
    },
  };
}

export type AddResult = { ok: boolean; clamped?: boolean; message?: string };

// Server calls run one at a time, and the store is replaced with the server's
// cart only when the last queued call finishes, so quick clicks never fight.
let queue: Promise<unknown> = Promise.resolve();
let pending = 0;

export function useCart() {
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const { openCartModal } = useCartModalContext();

  const state = () => store.getState();
  const isAuthed = () => state().authReducer.isAuthenticated;
  const findLine = (lineKey: string) => state().cartReducer.items.find((i) => lineKeyOf(i) === lineKey);

  const applyServerCart = useCallback(
    (cart: APICart) => dispatch(setCartItems(cart.items.map(mapAPICartItemToRedux))),
    [dispatch]
  );

  const fetchCart = useCallback(async () => {
    if (!isAuthed()) return;
    try {
      const cart: APICart = await api.get("/api/cart/");
      if (isAuthed()) applyServerCart(cart);
    } catch {
      /* keep what we have */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyServerCart]);

  /** Run a server call in order; on success show its cart, on failure resync. */
  const runOnServer = useCallback(
    (call: () => Promise<APICart | void>): Promise<{ cart?: APICart | void; error?: Error }> => {
      pending += 1;
      const task = queue.then(async () => {
        try {
          const cart = await call();
          return { cart };
        } catch (error) {
          return { error: error as Error };
        }
      });
      queue = task;
      return task.then(async (result) => {
        pending -= 1;
        if (pending === 0) {
          if (result.error) await fetchCart();
          else if (result.cart) applyServerCart(result.cart as APICart);
        }
        return result;
      });
    },
    [applyServerCart, fetchCart]
  );

  const addItem = useCallback(
    async (item: AddItemPayload): Promise<AddResult> => {
      const quantity = Math.max(1, Math.floor(item.quantity || 1));
      const label = item.variantName ? `${item.title} (${item.variantName})` : item.title;

      if (item.stock !== undefined && item.stock !== null && item.stock <= 0) {
        notifyCartError(`${item.title} is out of stock.`);
        return { ok: false, message: "out of stock" };
      }

      if (!isAuthed()) {
        const lineKey = makeLineKey(item);
        const before = findLine(lineKey)?.quantity ?? 0;
        dispatch(addItemToCart({ ...item, quantity, lineKey }));
        const after = findLine(lineKey)?.quantity ?? 0;
        if (after <= before) {
          notifyCartInfo(`You already have the maximum available (${after}) of ${item.title}.`, openCartModal);
          return { ok: false, clamped: true, message: "max in cart" };
        }
        const clamped = after - before < quantity;
        notifyAdded(label, openCartModal, clamped ? `Only ${after} available` : undefined);
        return { ok: true, clamped };
      }

      const { cart, error } = await runOnServer(() =>
        api.post<APICart>("/api/cart/add/", {
          product_id: item.id,
          quantity,
          variant_id: item.variantId,
        })
      );
      if (error) {
        notifyCartError(error.message || "Could not add this item to your cart.");
        return { ok: false, message: error.message };
      }
      const warning = (cart as APICart | undefined)?.warning;
      notifyAdded(label, openCartModal, warning);
      return { ok: true, clamped: !!warning, message: warning };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, runOnServer, openCartModal]
  );

  /** Add a product from a card/list: picks an in-stock variant and reports problems. */
  const addResolved = useCallback(
    async (item: Parameters<typeof resolveAddableItem>[0]): Promise<AddResult> => {
      const payload = await resolveAddableItem(item);
      if (!payload) {
        notifyCartError(`${item.title} is out of stock.`);
        return { ok: false, message: "out of stock" };
      }
      return addItem(payload);
    },
    [addItem]
  );

  const updateQuantity = useCallback(
    async (lineKey: string, quantity: number) => {
      const line = findLine(lineKey);
      if (!line) return;
      dispatch(updateCartItemQuantity({ lineKey, quantity }));
      if (!isAuthed() || !line.cartItemId) return;
      const wanted = findLine(lineKey)?.quantity ?? quantity;
      const { cart, error } = await runOnServer(() =>
        api.patch<APICart>(`/api/cart/items/${line.cartItemId}/`, { quantity: wanted })
      );
      if (error) notifyCartError(error.message || "Could not update the quantity.");
      else if ((cart as APICart | undefined)?.warning) notifyCartInfo((cart as APICart).warning!);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, runOnServer]
  );

  const removeItem = useCallback(
    async (lineKey: string) => {
      const line = findLine(lineKey);
      dispatch(removeItemFromCart(lineKey));
      if (!isAuthed() || !line?.cartItemId) return;
      const { error } = await runOnServer(() =>
        api.delete<APICart>(`/api/cart/items/${line.cartItemId}/remove/`)
      );
      if (error) notifyCartError(error.message || "Could not remove the item.");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, runOnServer]
  );

  const clearCart = useCallback(async () => {
    dispatch(removeAllItemsFromCart());
    clearLocalCart();
    if (isAuthed()) {
      const { error } = await runOnServer(() => api.post<APICart>("/api/cart/clear/"));
      if (error) notifyCartError(error.message || "Could not clear the cart.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, runOnServer]);

  /** After login: move the guest cart (kept in localStorage) to the server, then load the server cart. */
  const syncGuestCart = useCallback(async () => {
    if (!isAuthed()) return;
    const guestLines = loadLocalCart();
    for (const line of guestLines) {
      try {
        await api.post("/api/cart/add/", {
          product_id: line.id,
          quantity: line.quantity,
          variant_id: line.variantId,
        });
      } catch {
        /* skip lines that are no longer purchasable */
      }
    }
    clearLocalCart();
    await fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCart]);

  return useMemo(
    () => ({ fetchCart, addItem, addResolved, updateQuantity, removeItem, clearCart, syncGuestCart }),
    [fetchCart, addItem, addResolved, updateQuantity, removeItem, clearCart, syncGuestCart]
  );
}
