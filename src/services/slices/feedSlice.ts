import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';
import { getFeedsApi } from '@api';

type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isLoading: boolean;
};

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false
};

export const getFeeds = createAsyncThunk(
  'feed/getFeeds',
  async (_, { dispatch }) => {
    dispatch(resetFeeds());
    return await getFeedsApi();
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    resetFeeds: () => initialState
  },
  selectors: {
    allOrdersSelector: (state) => state.orders,
    ordersTotalSelector: (state) => state.total,
    ordersTotalTodaySelector: (state) => state.totalToday
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeeds.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(getFeeds.rejected, (state) => {
        state.isLoading = false;
      });
  }
});

export const {
  reducer: feedReducer,
  actions: { resetFeeds },
  selectors: {
    allOrdersSelector,
    ordersTotalSelector,
    ordersTotalTodaySelector
  }
} = feedSlice;
