import { configureStore } from '@reduxjs/toolkit';
import { orders as mockOrders } from '../__mocks__/orders';
import {
  ordersReducer,
  getOrders,
  getOrderByNumber,
  clearOrderDetails,
  ordersSelector,
  isOrdersLoadingSelector,
  orderDetailsSelector,
  isOrderDetailsLoadingSelector
} from '@slices';

import type { TFeedsResponse, TOrderResponse } from '@api';
import type { TOrdersState } from '@slices';

// Замокаем реализации наших функций работы с Cookies
jest.mock('../utils/cookie');

const initialState: TOrdersState = {
  orders: [],
  orderDetails: null,
  isLoading: false,
  isOrderDetailsLoading: false
};

const successFeedsResponse: TFeedsResponse = {
  success: true,
  orders: mockOrders,
  total: 789,
  totalToday: 2
};

const successOrderResponse: TOrderResponse = {
  success: true,
  orders: [mockOrders[0]]
};

describe('Тестирование слайса ordersSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Загрузка информации о заказах пользователя', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(successFeedsResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    const store = configureStore({
      reducer: { orders: ordersReducer }
    });

    expect(store.getState().orders).toEqual(initialState);

    await store.dispatch(getOrders());

    expect(store.getState().orders).toEqual({
      ...initialState,
      orders: successFeedsResponse.orders
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('Загрузка информации о конкретном заказе', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(successOrderResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    const store = configureStore({
      reducer: { orders: ordersReducer }
    });

    expect(store.getState().orders).toEqual(initialState);

    await store.dispatch(getOrderByNumber(mockOrders[0].number));

    expect(store.getState().orders).toEqual({
      ...initialState,
      orderDetails: successOrderResponse.orders[0]
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('Редьюсер clearOrderDetails', () => {
    const store = configureStore({
      reducer: { orders: ordersReducer },
      preloadedState: {
        orders: {
          ...initialState,
          orderDetails: mockOrders[0]
        }
      }
    });

    store.dispatch(clearOrderDetails());

    expect(store.getState().orders.orderDetails).toBeNull();
  });

  describe('getOrders async thunk', () => {
    test('состояние pending корректно обрабатывается', () => {
      const action = getOrders.pending('');
      const state = ordersReducer(initialState, action);
      expect(state).toEqual({ ...initialState, isLoading: true });
    });

    test('состояние rejected корректно обрабатывается', () => {
      const error = 'Something went wrong';
      const action = getOrders.rejected(new Error(error), '');
      const state = ordersReducer(initialState, action);
      expect(state).toEqual({ ...initialState });
    });

    test('состояние fullfilled корректно обрабатывается', () => {
      const action = getOrders.fulfilled(successOrderResponse.orders, '');
      const state = ordersReducer(initialState, action);
      expect(state).toEqual({
        ...initialState,
        orders: successOrderResponse.orders
      });
    });
  });

  describe('getOrderByNumber async thunk', () => {
    test('состояние pending корректно обрабатывается', () => {
      const action = getOrderByNumber.pending('', mockOrders[0].number);
      const state = ordersReducer(initialState, action);
      expect(state).toEqual({ ...initialState, isOrderDetailsLoading: true });
    });

    test('состояние rejected корректно обрабатывается', () => {
      const error = 'Something went wrong';
      const action = getOrderByNumber.rejected(
        new Error(error),
        '',
        mockOrders[0].number
      );

      const state = ordersReducer(initialState, action);

      expect(state).toEqual({ ...initialState });
    });

    test('состояние fullfilled корректно обрабатывается', () => {
      const action = getOrderByNumber.fulfilled(
        successOrderResponse,
        '',
        mockOrders[0].number
      );

      const state = ordersReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        orderDetails: successOrderResponse.orders[0]
      });
    });
  });

  describe('Селекторы', () => {
    const store = configureStore({
      reducer: { orders: ordersReducer },
      preloadedState: {
        orders: {
          orders: mockOrders,
          orderDetails: mockOrders[0],
          isLoading: false,
          isOrderDetailsLoading: false
        }
      }
    });

    test('ordersSelector возвращает корректное значение', () => {
      const orders = ordersSelector(store.getState());
      expect(orders).toEqual(mockOrders);
    });

    test('isOrdersLoadingSelector возвращает корректное значение', () => {
      const isLoading = isOrdersLoadingSelector(store.getState());
      expect(isLoading).toBe(false);
    });

    test('orderDetailsSelector возвращает корректное значение', () => {
      const orderDetails = orderDetailsSelector(store.getState());
      expect(orderDetails).toEqual(mockOrders[0]);
    });

    test('isOrderDetailsLoadingSelector возвращает корректное значение', () => {
      const isOrderDetailsLoading = isOrderDetailsLoadingSelector(
        store.getState()
      );
      expect(isOrderDetailsLoading).toBe(false);
    });
  });
});
