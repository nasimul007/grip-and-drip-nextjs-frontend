import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type ReduxCartItem = {
  id: number;
  cartItemId?: number;
  title: string;
  /** Regular (list) price; equals discountedPrice when there is no discount. */
  price: number;
  /** Price actually charged for one unit. */
  discountedPrice: number;
  quantity: number;
  /** Units available; undefined when unknown. */
  stock?: number;
  slug?: string;
  variantName?: string;
  variantId?: number;
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
  if (item.cartItemId) return String(item.cartItemId);
  return `${item.id}:${item.variantName || ""}`;
}

export const lineKeyOf = (item: ReduxCartItem) => item.lineKey || makeLineKey(item);

type InitialState = {
  items: ReduxCartItem[];
};

const GUEST_CART_KEY = "guest_cart";

/** Quantity allowed for an item: at least 1, at most the known stock. */
function clampQuantity(quantity: number, stock?: number): number {
  const q = Math.max(1, Math.floor(Number(quantity) || 1));
  return stock !== undefined && stock > 0 ? Math.min(q, stock) : q;
}

function normalize(item: ReduxCartItem): ReduxCartItem {
  const stock = item.stock !== undefined && item.stock !== null ? Number(item.stock) : undefined;
  return {
    ...item,
    price: Number(item.price),
    discountedPrice: Number(item.discountedPrice),
    stock,
    quantity: clampQuantity(item.quantity, stock),
    lineKey: item.lineKey || makeLineKey(item),
  };
}

/** Merge lines that share a key (summing quantities, capped at stock). */
function mergeLines(items: ReduxCartItem[]): ReduxCartItem[] {
  const merged = new Map<string, ReduxCartItem>();
  for (const raw of items) {
    const item = normalize(raw);
    const existing = merged.get(item.lineKey!);
    if (existing) {
      existing.quantity = clampQuantity(existing.quantity + item.quantity, existing.stock ?? item.stock);
    } else {
      merged.set(item.lineKey!, item);
    }
  }
  return Array.from(merged.values());
}

export function loadLocalCart(): ReduxCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const items: ReduxCartItem[] = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? mergeLines(items) : [];
  } catch {
    return [];
  }
}

export function saveLocalCart(items: ReduxCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {}
}

export function clearLocalCart() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch {}
}

// Starts empty so server and client render the same markup; the guest cart is
// loaded from localStorage after mount and saved by StoreHydrator.
const initialState: InitialState = {
  items: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<ReduxCartItem[]>) => {
      state.items = mergeLines(action.payload);
    },
    addItemToCart: (state, action: PayloadAction<ReduxCartItem>) => {
      state.items = mergeLines([...state.items, action.payload]);
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => lineKeyOf(item) !== action.payload);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ lineKey: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => lineKeyOf(i) === action.payload.lineKey);
      if (item) item.quantity = clampQuantity(action.payload.quantity, item.stock);
    },
    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.discountedPrice * item.quantity, 0)
);

export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
);

export const {
  setCartItems,
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;

export default cart.reducer;
