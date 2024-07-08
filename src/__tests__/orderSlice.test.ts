import { configureStore } from '@reduxjs/toolkit';
import { ingredients as mockIngredients } from '../__mocks__/ingedients';
import {
  orderReducer,
  orderBurger,
  resetOrder,
  orderRequestSelector,
  orderSelector,
  TOrderState
} from '@slices';

import { TNewOrderResponse } from '@api';
import { TOrder } from '../utils/types';

// Замокаем реализации наших функций работы с Cookies
jest.mock('../utils/cookie');

const ingredientsIds = [
  mockIngredients[0],
  mockIngredients[1],
  mockIngredients[0]
].map((ingredient) => ingredient._id);

const mockOrder: TOrder = {
  ingredients: ingredientsIds,
  _id: '668badc5119d45001b4f5454',
  status: 'done',
  name: 'Флюоресцентный био-марсианский бургер',
  createdAt: '2024-07-08T09:13:41.358Z',
  updatedAt: '2024-07-08T09:13:41.736Z',
  number: 45194
};

const mockOrderResponse: TNewOrderResponse = {
  success: true,
  name: mockOrder.name,
  order: mockOrder
};

const initialState: TOrderState = {
  order: null,
  orderRequest: false
};

describe('Тестирование слайса orderSlice', () => {
  test('Заказ бургера', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockOrderResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    const store = configureStore({
      reducer: { order: orderReducer }
    });

    expect(store.getState().order).toEqual(initialState);

    await store.dispatch(orderBurger(ingredientsIds));

    expect(store.getState().order).toEqual({
      order: mockOrder,
      orderRequest: false
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('resetOrder', () => {
    const store = configureStore({
      reducer: { order: orderReducer },
      preloadedState: {
        order: { ...initialState, order: mockOrder }
      }
    });

    store.dispatch(resetOrder());

    expect(store.getState().order).toEqual(initialState);
  });

  describe('orderBurger async thunk', () => {
    test('состояние pending корректно обрабатывается', () => {
      const action = orderBurger.pending('', ingredientsIds);
      const state = orderReducer(initialState, action);
      expect(state).toEqual({ ...initialState, orderRequest: true });
    });

    test('состояние rejected корректно обрабатывается', () => {
      const error = 'Something went wrong';
      const action = orderBurger.rejected(new Error(error), '', ingredientsIds);
      const state = orderReducer(initialState, action);
      expect(state).toEqual({ ...initialState });
    });

    test('состояние fullfilled корректно обрабатывается', () => {
      const action = orderBurger.fulfilled(
        mockOrderResponse,
        '',
        ingredientsIds
      );

      const state = orderReducer(initialState, action);

      expect(state).toEqual({
        order: mockOrderResponse.order,
        orderRequest: false
      });
    });
  });

  describe('Селекторы', () => {
    const store = configureStore({
      reducer: { order: orderReducer },
      preloadedState: {
        order: { ...initialState, order: mockOrder }
      }
    });

    test('orderRequestSelector возвращает корректное значение', () => {
      const orderRequest = orderRequestSelector(store.getState());
      expect(orderRequest).toEqual(initialState.orderRequest);
    });

    test('orderSelector возвращает корректное значение', () => {
      const order = orderSelector(store.getState());
      expect(order).toBe(mockOrder);
    });
  });
});
