import { TIngredient } from '@utils-types';
import { configureStore } from '@reduxjs/toolkit';
import { ingredients as mockIngredients } from '../__mocks__/ingedients';
import {
  ingredientsSelector,
  isIngredientsLoadingSelector,
  ingredientsReducer,
  fetchIngredients
} from '@slices';
import { getIngredientsApi } from '@api';
import { flattenDiagnosticMessageText } from 'typescript';
import { beforeEach } from 'node:test';

describe('Тестирование слайса ingredientsSlice', () => {
  describe('Тестирование загрузки ингредиентов', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('Успешная загрузка', async () => {
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

    test('Ошибка загрузки ингредиентов', async () => {
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

  describe('Тестирование редьюсера fetchIngredients', () => {
    beforeEach(() => {});

    const initialState = { ingredients: [], isLoading: false, error: null };

    test('pending', () => {
      const newState = ingredientsReducer(
        initialState,
        fetchIngredients.pending('')
      );

      expect(newState.isLoading).toBe(true);
    });

    test('rejected', () => {
      const newState = ingredientsReducer(
        initialState,
        fetchIngredients.rejected(new Error('Test error'), '')
      );

      expect(newState.ingredients).toEqual([]);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Test error');
    });

    test('fullfilled', () => {
      const newState = ingredientsReducer(
        initialState,
        fetchIngredients.rejected(new Error('Test error'), '')
      );

      expect(newState.ingredients).toEqual([]);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Test error');
    });
  });
});
