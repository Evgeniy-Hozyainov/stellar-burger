import { rootReducer } from '../services/store';
import { configureStore } from '@reduxjs/toolkit';

test('rootReducer правильно инициализируется и работает', () => {
  // Инициализируем хранилище
  const store = configureStore({
    reducer: rootReducer
  });

  // Вызовем rootReducer с undefined состоянием и необрабатываемым экшеном
  const testState = rootReducer(undefined, { type: 'UNKNOWN_ACTION' });

  // Проверим, что rootReducer вернул корректное начальное состояние хранилища.
  expect(testState).toEqual(store.getState());
});
