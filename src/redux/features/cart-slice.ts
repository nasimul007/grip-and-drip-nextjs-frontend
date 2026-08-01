import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type ReduxCartItem = {
  id: number;
  cartItemId?: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  stock?: number;
  slug?: string;
  variantName?: string;
  lineKey?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

export function makeLineKey(item: {
  id: number;
  cartItemId?: number;
  variantName?: string;
}): string {
  return item.cartItemId
    ? String(item.cartItemId)
    : `${item.id}:${item.variantName || ""}`;
}

type InitialState = {
  items: ReduxCartItem[];
};

const LOCAL_KEY = "guest_cart";

function loadLocalCart(): ReduxCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const items: ReduxCartItem[] = raw ? JSON.parse(raw) : [];
    return items.map((item) => ({
      ...item,
      price: Number(item.price),
      discountedPrice: Number(item.discountedPrice),
      lineKey: item.lineKey || makeLineKey(item),
    }));
  } catch {
    return [];
  }
}

function saveLocalCart(items: ReduxCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch {}
}

const initialState: InitialState = {
  items: typeof window !== "undefined" ? loadLocalCart() : [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<ReduxCartItem[]>) => {
      state.items = action.payload;
    },
    addItemToCart: (state, action: PayloadAction<ReduxCartItem>) => {
      const {
        id,
        cartItemId,
        title,
        price,
        quantity,
        discountedPrice,
        imgs,
        variantName,
        stock,
        slug,
      } = action.payload;
      const lineKey = action.payload.lineKey || makeLineKey(action.payload);

      if (stock !== undefined && Number(stock) === 0) return;

      const existingItem = state.items.find((item) =>
        item.lineKey ? item.lineKey === lineKey : item.id === id
      );

      if (existingItem) {
        existingItem.quantity = Math.min(
          existingItem.quantity + quantity,
          existingItem.stock ?? Infinity
        );
      } else {
        state.items.push({
          id,
          cartItemId,
          title,
          price: Number(price),
          quantity,
          discountedPrice: Number(discountedPrice),
          imgs,
          variantName,
          stock,
          slug,
          lineKey,
        });
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const lineKey = action.payload;
      state.items = state.items.filter(
        (item) => (item.lineKey || makeLineKey(item)) !== lineKey
      );
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ lineKey: string; quantity: number }>
    ) => {
      const { lineKey, quantity } = action.payload;
      const existingItem = state.items.find(
        (item) => (item.lineKey || makeLineKey(item)) === lineKey
      );
      if (existingItem) {
        existingItem.quantity = Math.min(
          quantity,
          existingItem.stock ?? Infinity
        );
      }
    },
    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
});

export const {
  setCartItems,
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;

export function persistGuestCart(items: ReduxCartItem[]) {
  saveLocalCart(items);
}

export default cart.reducer;
