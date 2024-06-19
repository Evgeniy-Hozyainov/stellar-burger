import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderBurgerApi } from '@api';
import type { TOrder } from '@utils-types';

type TOrderState = {
  order: TOrder | null;
  orderRequest: boolean;
};

const initialState: TOrderState = {
  order: null,
  orderRequest: false
};

export const orderBurger = createAsyncThunk(
  'order/orderBurger',
  (ingredients: string[]) => orderBurgerApi(ingredients)
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrder: () => initialState
  },
  selectors: {
    orderRequestSelector: (state) => state.orderRequest,
    orderSelector: (state) => state.order
  },
  extraReducers: (builder) => {
    builder
      .addCase(orderBurger.pending, (state) => {
        state.orderRequest = true;
      })
      .addCase(orderBurger.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.order = action.payload.order;
      });
  }
});

export const {
  reducer: orderReducer,
  actions: { resetOrder },
  selectors: { orderRequestSelector, orderSelector }
} = orderSlice;
