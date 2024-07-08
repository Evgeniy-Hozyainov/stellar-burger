import { configureStore } from '@reduxjs/toolkit';
import { TRegisterData, TLoginData } from '@api';
import { TUser } from '../utils/types';
import {
  userReducer,
  registerUser,
  getUser,
  updateUser,
  authChecked,
  loginUser,
  userLogout,
  TUserState,
  userSelector,
  isAuthCheckedSelector
} from '@slices';

// Замокаем реализации наших функций работы с Cookies
jest.mock('../utils/cookie');
// и реализацию localStorage
global.localStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

const stubPassword = 'pa55w0rd';
const stubAccessToken = 'stubAccessToken';
const stubRefreshToken = 'stubRefreshToken';

const stubUser: TUser = {
  email: 'billy@m.com',
  name: 'billy'
};

const loginData: TLoginData = {
  email: stubUser.email,
  password: stubPassword
};

const loginResponse = {
  success: true,
  accessToken: stubAccessToken,
  refreshToken: stubRefreshToken,
  user: stubUser
};

const getUserResponse = {
  success: true,
  user: stubUser
};

const registerData: TRegisterData = {
  name: stubUser.name,
  email: stubUser.email,
  password: stubPassword
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false
};

describe('Тестирование слайса userSlice', () => {
  test('Login', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(loginResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    const store = configureStore({
      reducer: { user: userReducer }
    });

    await store.dispatch(
      loginUser({ email: stubUser.email, password: stubPassword })
    );

    expect(store.getState().user.user).toEqual(loginResponse.user);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('Logout', () => {
    const store = configureStore({
      reducer: { user: userReducer },
      preloadedState: {
        user: { ...initialState, user: stubUser }
      }
    });

    store.dispatch(userLogout());

    expect(store.getState().user.user).toBeNull();
  });

  test('authChecked', () => {
    const store = configureStore({
      reducer: { user: userReducer }
    });

    expect(store.getState().user.isAuthChecked).toBe(false);
    store.dispatch(authChecked());
    expect(store.getState().user.isAuthChecked).toBe(true);
  });

  describe('loginUser async thunk', () => {
    test('состояние pending корректно обрабатывается', () => {
      const action = loginUser.pending('', loginData);
      const state = userReducer(initialState, action);
      expect(state).toBe(initialState);
    });

    test('состояние rejected корректно обрабатывается', () => {
      const action = loginUser.rejected(new Error('Error'), '', loginData);
      const state = userReducer(initialState, action);
      expect(state).toBe(initialState);
    });

    test('состояние fullfilled корректно обрабатывается', () => {
      const action = loginUser.fulfilled(stubUser, '', loginData);
      const state = userReducer(initialState, action);
      expect(state.user).toEqual(stubUser);
    });
  });

  describe('getUser async thunk', () => {
    test('состояние pending корректно обрабатывается', () => {
      const action = getUser.pending('');
      const state = userReducer(initialState, action);
      expect(state).toBe(initialState);
    });

    test('состояние rejected корректно обрабатывается', () => {
      const action = getUser.rejected(new Error('Error'), '');
      const state = userReducer(initialState, action);
      expect(state).toBe(initialState);
    });

    test('состояние fullfilled корректно обрабатывается', () => {
      const action = getUser.fulfilled(getUserResponse, '');
      const state = userReducer(initialState, action);
      expect(state.user).toEqual(getUserResponse.user);
    });
  });

  describe('updateUser async thunk', () => {
    test('состояние pending корректно обрабатывается', () => {
      const action = updateUser.pending('', registerData);
      const state = userReducer(initialState, action);
      expect(state).toBe(initialState);
    });

    test('состояние rejected корректно обрабатывается', () => {
      const action = updateUser.rejected(new Error('Error'), '', registerData);
      const state = userReducer(initialState, action);
      expect(state).toBe(initialState);
    });

    test('состояние fullfilled корректно обрабатывается', () => {
      const action = updateUser.fulfilled(getUserResponse, '', registerData);
      const state = userReducer(initialState, action);
      expect(state.user).toEqual(getUserResponse.user);
    });
  });

  describe('registerUser async thunk', () => {
    test('состояние pending корректно обрабатывается', () => {
      const action = registerUser.pending('', registerData);
      const state = userReducer(initialState, action);
      expect(state).toBe(initialState);
    });

    test('состояние rejected корректно обрабатывается', () => {
      const action = registerUser.rejected(
        new Error('Error'),
        '',
        registerData
      );
      const state = userReducer(initialState, action);
      expect(state).toBe(initialState);
    });

    test('состояние fullfilled корректно обрабатывается', () => {
      const action = registerUser.fulfilled(stubUser, '', registerData);
      const state = userReducer(initialState, action);
      expect(state.user).toEqual(stubUser);
    });
  });

  describe('Селекторы', () => {
    const store = configureStore({
      reducer: { user: userReducer },
      preloadedState: {
        user: { user: stubUser, isAuthChecked: true }
      }
    });

    test('userSelector возвращает корректное значение', () => {
      const user = userSelector(store.getState());
      expect(user).toEqual(stubUser);
    });

    test('isAuthCheckedSelector возвращает корректное значение', () => {
      const isAuthChecked = isAuthCheckedSelector(store.getState());
      expect(isAuthChecked).toBe(true);
    });
  });
});
