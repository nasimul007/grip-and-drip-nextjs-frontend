import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type ReduxCartItem = {
  id: number;
  cartItemId?: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

type InitialState = {
  items: ReduxCartItem[];
};

const LOCAL_KEY = "guest_cart";

function loadLocalCart(): ReduxCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
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
      const { id, cartItemId, title, price, quantity, discountedPrice, imgs } =
        action.payload;
      const existingItem = state.items.find(
        (item) => item.cartItemId
          ? item.cartItemId === cartItemId
          : item.id === id
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          cartItemId,
          title,
          price,
          quantity,
          discountedPrice,
          imgs,
        });
      }
    },
    removeItemFromCart: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      state.items = state.items.filter(
        (item) => item.id !== id && item.cartItemId !== id
      );
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find(
        (item) => item.cartItemId === id || item.id === id
      );
      if (existingItem) {
        existingItem.quantity = quantity;
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
