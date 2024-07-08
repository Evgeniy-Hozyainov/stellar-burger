import { TIngredient } from '@utils-types';
import { configureStore } from '@reduxjs/toolkit';
import { ingredients as mockIngredients } from '../__mocks__/ingedients';
import {
  ingredientsSelector,
  isIngredientsLoadingSelector,
  ingredientsReducer,
  fetchIngredients,
  TIngredientsState
} from '@slices';

describe('Тестирование слайса ingredientsSlice', () => {
  describe('Тестирование загрузки ингредиентов', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('Успешная загрузка корректно обрабатывается', async () => {
      jest.spyOn(global, 'fetch').mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ success: true, data: mockIngredients }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      );

      const store = configureStore({
        reducer: { ingredients: ingredientsReducer }
      });

      expect(store.getState().ingredients.ingredients).toEqual([]);

      await store.dispatch(fetchIngredients());

      const {
        ingredients: ingredientsInStore,
        isLoading,
        error
      } = store.getState().ingredients;

      expect(ingredientsInStore).toEqual(mockIngredients);
      expect(isLoading).toBe(false);
      expect(error).toBeNull();
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('Ошибка загрузки ингредиентов корректно обрабатывается', async () => {
      jest.spyOn(global, 'fetch').mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ success: false }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        )
      );

      const store = configureStore({
        reducer: { ingredients: ingredientsReducer }
      });

      await store.dispatch(fetchIngredients());

      const {
        ingredients: ingredientsInStore,
        isLoading,
        error
      } = store.getState().ingredients;

      expect(ingredientsInStore).toEqual([]);
      expect(error).not.toBeNull();
      expect(isLoading).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchIngredients async thunk', () => {
    const initialState: TIngredientsState = {
      ingredients: [],
      isLoading: false,
      error: null
    };

    test('состояние pending корректно обрабатывается', () => {
      const action = fetchIngredients.pending('');
      const state = ingredientsReducer(initialState, action);
      expect(state).toEqual({ ...initialState, isLoading: true });
    });

    test('состояние rejected корректно обрабатывается', () => {
      const error = 'Something went wrong';
      const action = fetchIngredients.rejected(new Error(error), '');
      const state = ingredientsReducer(initialState, action);
      expect(state).toEqual({ ...initialState, error, isLoading: false });
    });

    test('состояние fullfilled корректно обрабатывается', async () => {
      const action = fetchIngredients.fulfilled(mockIngredients, '');
      const state = ingredientsReducer(initialState, action);
      expect(state).toEqual({
        ingredients: mockIngredients,
        error: null,
        isLoading: false
      });
    });
  });

  describe('Селекторы', () => {
    const store = configureStore({
      reducer: { ingredients: ingredientsReducer },
      preloadedState: {
        ingredients: {
          ingredients: mockIngredients,
          isLoading: false,
          error: null
        }
      }
    });

    test('ingredientsSelector возвращает корректное значение', () => {
      const ingedients = ingredientsSelector(store.getState());
      expect(ingedients).toEqual(mockIngredients);
    });

    test('isIngredientsLoadingSelector возвращает корректное значение', () => {
      const isLoading = isIngredientsLoadingSelector(store.getState());
      expect(isLoading).toBe(false);
    });
  });
});
