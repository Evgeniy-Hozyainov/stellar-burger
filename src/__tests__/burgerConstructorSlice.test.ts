import { ingredients as mockIingredients } from '../__mocks__/ingedients';
import {
  burgerConstructorReducer,
  addItemToConstructor,
  removeItemFromConstructor,
  moveItemUpInConstructor,
  moveItemDownInConstructor,
  TBurgerState
} from '@slices';

describe('Тестирование редьюсера слайса burgerConstructor', () => {
  test('Добавление ингредиентов', () => {
    const initialState: TBurgerState = {
      bun: null,
      ingredients: []
    };

    const bun = mockIingredients[0];
    const main = mockIingredients[1];
    const sauce = mockIingredients[3];

    // Добавим булку
    let state = burgerConstructorReducer(
      initialState,
      addItemToConstructor(bun)
    );
    const { id: bunId, ...bunWithoutId } = state.bun!;
    expect(bunWithoutId).toEqual(bun);

    // Добавим начинку
    state = burgerConstructorReducer(state, addItemToConstructor(main));
    const { id: mainId, ...mainWithoutId } = state.ingredients[0]!;
    expect(mainWithoutId).toEqual(main);

    // Добавим соус
    state = burgerConstructorReducer(state, addItemToConstructor(sauce));
    const { id: sauceId, ...sauceWithoutId } = state.ingredients[1]!;
    expect(sauceWithoutId).toEqual(sauce);

    expect(state.ingredients).toHaveLength(2);
  });

  test('Удаление ингредиента', () => {
    // Создадим начальное состояние с тремя ингредиентами
    const initialState: TBurgerState = {
      bun: null,
      ingredients: [
        { ...mockIingredients[1], id: '1' },
        { ...mockIingredients[2], id: '2' },
        { ...mockIingredients[3], id: '3' }
      ]
    };

    // Удалим из конструктора средний ингредиент (с индексом 1)
    const state = burgerConstructorReducer(
      initialState,
      removeItemFromConstructor(1)
    );
    expect(state.ingredients).toHaveLength(2);
    expect(state.ingredients[0].id).toBe('1');
    expect(state.ingredients[1].id).toBe('3');
  });

  test('Изменение порядка ингредиентов в начинке', () => {
    // Создадим начальное состояние с тремя ингредиентами
    const initialState: TBurgerState = {
      bun: null,
      ingredients: [
        { ...mockIingredients[1], id: '1' },
        { ...mockIingredients[2], id: '2' },
        { ...mockIingredients[3], id: '3' }
      ]
    };

    // Попробуем переместить вверх самый первый ингредиент (с индексом 0)
    let actionMoveUp = moveItemUpInConstructor(0);
    let state = burgerConstructorReducer(initialState, actionMoveUp);
    // Состояние не должно измениться
    expect(state).toEqual(initialState);

    // Попробуем переместить вниз самый последний ингредиент (с индексом 2)
    state = burgerConstructorReducer(
      initialState,
      moveItemDownInConstructor(2)
    );
    // Состояние не должно измениться
    expect(state).toEqual(initialState);

    // Переместим вверх самый последний ингредиент (с индексом 2)
    state = burgerConstructorReducer(initialState, moveItemUpInConstructor(2));
    // Проверим, что состояние изменилось корректно
    expect(state.ingredients[0].id).toBe('1');
    expect(state.ingredients[1].id).toBe('3');
    expect(state.ingredients[2].id).toBe('2');

    // Переместим вниз самый первый ингредиент (с индексом 0)
    state = burgerConstructorReducer(state, moveItemDownInConstructor(0));
    // Проверим, что состояние изменилось корректно
    expect(state.ingredients[0].id).toBe('3');
    expect(state.ingredients[1].id).toBe('1');
    expect(state.ingredients[2].id).toBe('2');
  });
});
