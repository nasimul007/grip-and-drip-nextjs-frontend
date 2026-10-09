import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  items: WishListItem[];
};

type WishListItem = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  slug?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

const LOCAL_KEY = "guest_wishlist";

export function loadLocalWishlist(): WishListItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const items: WishListItem[] = raw ? JSON.parse(raw) : [];
    return items.map((item) => ({
      ...item,
      price: Number(item.price),
      discountedPrice: Number(item.discountedPrice),
    }));
  } catch {
    return [];
  }
}

function saveLocalWishlist(items: WishListItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch {}
}

const initialState: InitialState = {
  items: [], // loaded from localStorage after mount (see StoreHydrator)
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistItems: (state, action: PayloadAction<WishListItem[]>) => {
      state.items = action.payload;
    },
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const { id, title, price, quantity, imgs, discountedPrice, status, slug } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          title,
          price: Number(price),
          quantity,
          imgs,
          discountedPrice: Number(discountedPrice),
          status,
          slug,
        });
      }
      saveLocalWishlist(state.items);
    },
    removeItemFromWishlist: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      saveLocalWishlist(state.items);
    },

    removeAllItemsFromWishlist: (state) => {
      state.items = [];
      saveLocalWishlist(state.items);
    },
  },
});

export const {
  setWishlistItems,
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;
export default wishlist.reducer;
