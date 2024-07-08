import { configureStore } from '@reduxjs/toolkit';
import { orders as mockOrders } from '../__mocks__/orders';
import {
  feedReducer,
  getFeeds,
  TFeedState,
  allOrdersSelector,
  ordersTotalSelector,
  ordersTotalTodaySelector
} from '@slices';

const successFeedsResponse = {
  success: true,
  orders: mockOrders,
  total: 789,
  totalToday: 2
};

describe('Тестирование слайса feedSlice', () => {
  test('Успешная загрузка корректно обрабатывается', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(successFeedsResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    const store = configureStore({
      reducer: { feed: feedReducer }
    });

    expect(store.getState().feed).toEqual({
      orders: [],
      total: 0,
      totalToday: 0,
      isLoading: false
    });

    await store.dispatch(getFeeds());

    expect(store.getState().feed).toEqual({
      orders: successFeedsResponse.orders,
      total: successFeedsResponse.total,
      totalToday: successFeedsResponse.totalToday,
      isLoading: false
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  describe('getFeeds async thunk', () => {
    const initialState: TFeedState = {
      orders: [],
      total: 0,
      totalToday: 0,
      isLoading: false
    };

    test('состояние pending корректно обрабатывается', () => {
      const action = getFeeds.pending('');
      const state = feedReducer(initialState, action);
      expect(state).toEqual({ ...initialState, isLoading: true });
    });

    test('состояние rejected корректно обрабатывается', () => {
      const error = 'Something went wrong';
      const action = getFeeds.rejected(new Error(error), '');
      const state = feedReducer(initialState, action);
      expect(state).toEqual({ ...initialState });
    });

    test('состояние fullfilled корректно обрабатывается', async () => {
      const action = getFeeds.fulfilled(successFeedsResponse, '');
      const state = feedReducer(initialState, action);
      expect(state).toEqual({
        orders: successFeedsResponse.orders,
        total: successFeedsResponse.total,
        totalToday: successFeedsResponse.totalToday,
        isLoading: false
      });
    });
  });

  describe('Селекторы', () => {
    const store = configureStore({
      reducer: { feed: feedReducer },
      preloadedState: {
        feed: {
          orders: successFeedsResponse.orders,
          total: successFeedsResponse.total,
          totalToday: successFeedsResponse.totalToday,
          isLoading: false
        }
      }
    });

    test('allOrdersSelector возвращает корректное значение', () => {
      const orders = allOrdersSelector(store.getState());
      expect(orders).toEqual(successFeedsResponse.orders);
    });

    test('isIngredientsLoadingSelector возвращает корректное значение', () => {
      const total = ordersTotalSelector(store.getState());
      expect(total).toBe(successFeedsResponse.total);
    });

    test('ordersTotalTodaySelector возвращает корректное значение', () => {
      const total = ordersTotalTodaySelector(store.getState());
      expect(total).toBe(successFeedsResponse.totalToday);
    });
  });
});
