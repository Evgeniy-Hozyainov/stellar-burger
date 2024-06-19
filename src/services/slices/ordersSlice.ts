import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';
import { getOrdersApi, getOrderByNumberApi } from '@api';

type TOrdersState = {
  orders: TOrder[];
  orderDetails: TOrder | null;
  isLoading: boolean;
  isOrderDetailsLoading: boolean;
};

const initialState: TOrdersState = {
  orders: [],
  orderDetails: null,
  isLoading: false,
  isOrderDetailsLoading: false
};

export const getOrders = createAsyncThunk('orders/getOrders', () =>
  getOrdersApi()
);

export const getOrderByNumber = createAsyncThunk(
  'orders/getOrderByNumberApi',
  (number: number) => getOrderByNumberApi(number)
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderDetails: (state) => {
      state.orderDetails = null;
    }
  },
  selectors: {
    ordersSelector: (state) => state.orders,
    isOrdersLoadingSelector: (state) => state.isLoading,
    isOrderDetailsLoadingSelector: (state) => state.isOrderDetailsLoading,
    orderDetailsSelector: (state) => state.orderDetails
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getOrderByNumber.pending, (state) => {
        state.isOrderDetailsLoading = true;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.isOrderDetailsLoading = false;
        state.orderDetails = action.payload.orders[0];
      })
      .addCase(getOrderByNumber.rejected, (state) => {
        state.isOrderDetailsLoading = false;
      });
  }
});

export const {
  reducer: ordersReducer,
  actions: { clearOrderDetails },
  selectors: {
    ordersSelector,
    isOrdersLoadingSelector,
    orderDetailsSelector,
    isOrderDetailsLoadingSelector
  }
} = ordersSlice;
