import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  registerUserApi,
  getUserApi,
  updateUserApi,
  loginUserApi,
  logoutApi
} from '@api';
import type { TLoginData, TRegisterData } from '@api';
import { setCookie, getCookie, deleteCookie } from '../../utils/cookie';

import type { TUser } from '@utils-types';

export type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false
};

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (userCredentials: TRegisterData) => {
    const data = await registerUserApi(userCredentials);
    setCookie('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.user;
  }
);

export const getUser = createAsyncThunk('user/getUser', () => getUserApi());

export const updateUser = createAsyncThunk(
  'user/updateUser',
  (userCredentials: TRegisterData) => updateUserApi(userCredentials)
);

export const checkUserAuth = createAsyncThunk(
  'user/checkUser',
  (_, { dispatch }) => {
    if (getCookie('accessToken')) {
      dispatch(getUser()).finally(() => {
        dispatch(authChecked());
      });
    } else {
      dispatch(authChecked());
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (userCredentials: TLoginData) => {
    const data = await loginUserApi(userCredentials);
    setCookie('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.user;
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  (_, { dispatch }) => {
    logoutApi()
      .then(() => {
        localStorage.clear();
        deleteCookie('accessToken');
        dispatch(userLogout());
      })
      .catch(() => {
        console.log('Ошибка выполнения выхода');
      });
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authChecked: (state) => {
      state.isAuthChecked = true;
    },
    userLogout: (state) => {
      state.user = null;
    }
  },
  selectors: {
    userSelector: (state) => state.user,
    isAuthCheckedSelector: (state) => state.isAuthChecked
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.user = payload;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.user = payload;
      });
  }
});

export const {
  reducer: userReducer,
  actions: { authChecked, userLogout },
  selectors: { userSelector, isAuthCheckedSelector }
} = userSlice;
