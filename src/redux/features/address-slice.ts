import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Address, AddressFormData } from "@/lib/types";
import { api } from "@/lib/api";

type AddressState = {
  addresses: Address[];
  loading: boolean;
  error: string | null;
};

const initialState: AddressState = {
  addresses: [],
  loading: false,
  error: null,
};

export const fetchAddresses = createAsyncThunk<Address[]>(
  "address/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getAddresses();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch addresses");
    }
  }
);

export const createAddress = createAsyncThunk<Address, AddressFormData>(
  "address/createAddress",
  async (data, { rejectWithValue }) => {
    try {
      return await api.createAddress(data);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to create address");
    }
  }
);

export const updateAddress = createAsyncThunk<Address, { id: number; data: Partial<AddressFormData> }>(
  "address/updateAddress",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await api.updateAddress(id, data);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to update address");
    }
  }
);

export const deleteAddress = createAsyncThunk<number, number>(
  "address/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteAddress(id);
      return id;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to delete address");
    }
  }
);

export const setDefaultShipping = createAsyncThunk<Address, number>(
  "address/setDefaultShipping",
  async (id, { rejectWithValue }) => {
    try {
      await api.setDefaultShipping(id);
      const addresses = await api.getAddresses();
      return addresses.find(a => a.id === id)!;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to set default shipping");
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action: PayloadAction<PaginatedResponse<Address>>) => {
        state.loading = false;
        state.addresses = action.payload.results;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state, action: PayloadAction<Address>) => {
        state.loading = false;
        if (Array.isArray(state.addresses)) {
          state.addresses.unshift(action.payload);
        } else {
          state.addresses = [action.payload];
        }
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action: PayloadAction<Address>) => {
        state.loading = false;
        if (Array.isArray(state.addresses)) {
          const idx = state.addresses.findIndex(a => a.id === action.payload.id);
          if (idx !== -1) state.addresses[idx] = action.payload;
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        if (Array.isArray(state.addresses)) {
          state.addresses = state.addresses.filter(a => a.id !== action.payload);
        }
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(setDefaultShipping.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultShipping.fulfilled, (state, action: PayloadAction<Address>) => {
        state.loading = false;
        if (Array.isArray(state.addresses)) {
          state.addresses = state.addresses.map(a =>
            a.id === action.payload.id ? action.payload : { ...a, is_default_shipping: false }
          );
        }
      })
      .addCase(setDefaultShipping.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = addressSlice.actions;
export default addressSlice.reducer;