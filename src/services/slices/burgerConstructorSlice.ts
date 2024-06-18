import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { TIngredient, TConstructorIngredient } from '@utils-types';
import { act } from 'react-dom/test-utils';

export interface TBurgerState {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
}

const initialState: TBurgerState = {
  bun: null,
  ingredients: []
};

const getUID = () => Math.random().toString(36).substring(2);

const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addItemToConstructor: (state, action: PayloadAction<TIngredient>) => {
      if (action.payload.type === 'bun') {
        state.bun = { ...action.payload, id: getUID() };
      } else {
        state.ingredients.push({ ...action.payload, id: getUID() });
      }
    },
    removeItemFromConstructor: (state, action: PayloadAction<number>) => {
      state.ingredients.splice(action.payload, 1);
    },
    moveItemUpInConstructor: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index > 0) {
        const temp = state.ingredients[index];
        state.ingredients[index] = state.ingredients[index - 1];
        state.ingredients[index - 1] = temp;
      }
    },
    moveItemDownInConstructor: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index < state.ingredients.length - 1) {
        const temp = state.ingredients[index];
        state.ingredients[index] = state.ingredients[index + 1];
        state.ingredients[index + 1] = temp;
      }
    },
    clearConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
    }
  }
});

export const {
  reducer: burgerConstructorReducer,
  actions: {
    addItemToConstructor,
    removeItemFromConstructor,
    moveItemUpInConstructor,
    moveItemDownInConstructor,
    clearConstructor
  }
} = burgerConstructorSlice;
