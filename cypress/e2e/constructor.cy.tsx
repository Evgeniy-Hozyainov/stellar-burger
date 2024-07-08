/// <reference types="cypress" />

// Селекторы
const bunListSelector = 'main section:nth-of-type(1) > div > ul:nth-of-type(1)';
const fillingListSelector =
  'main section:nth-of-type(1) > div > ul:nth-of-type(2)';
const sauceListSelector =
  'main section:nth-of-type(1) > div > ul:nth-of-type(3)';

const topBunConstrSelector = '.constructor-element.constructor-element_pos_top';
const bottomBunConstrSelector =
  '.constructor-element.constructor-element_pos_bottom';

const ingredientListInConstrSelector = 'main section:nth-of-type(2) > ul';

const setInitialState = () => {
  cy.intercept('GET', '/api/ingredients', { fixture: 'ingredients.json' }).as(
    'getIngredients'
  );
  cy.viewport(1280, 720);
  cy.visit('/');

  cy.wait('@getIngredients');
};

describe('Тестирование работы конструктора', () => {
  beforeEach(setInitialState);

  it('Добавление ингредиентов из списка в конструктор', () => {
    // Добавим в конструктор булку, которая идёт первой в списке ингредиентов
    cy.get(`${bunListSelector} > li:first-child > .common_button`).click();

    // Убедимся, что выбранная булка была добавлена в конструктор
    cy.get(topBunConstrSelector).should(
      'contain',
      'Краторная булка N-200i (верх)'
    );
    cy.get(bottomBunConstrSelector).should(
      'contain',
      'Краторная булка N-200i (низ)'
    );

    // Заменим первую булку на вторую в списке ингредиентов
    cy.get(`${bunListSelector} > li:nth-child(2) > .common_button`).click();
    // Проверим счётчик кол-ва выбранного ингредиента в конструкторе
    cy.get(`${bunListSelector} > li:nth-child(2) .counter__num`).should(
      'have.text',
      '2'
    );

    // Убедимся, что в конструкторе выбрана вторая булка
    cy.get(topBunConstrSelector).should(
      'contain',
      'Флюоресцентная булка R2-D3 (верх)'
    );
    cy.get(bottomBunConstrSelector).should(
      'contain',
      'Флюоресцентная булка R2-D3 (низ)'
    );

    // Добавим в конструктор начинку (тип 'main'), которая идёт второй в fixture (ingredients.json)
    cy.get(`${fillingListSelector} > li:nth-child(2) > .common_button`).click();

    // Добавим в конструктор соус (тип 'sauce'), который идёт первым в fixture
    cy.get(`${sauceListSelector} > li:nth-child(1) > .common_button`).click();

    // Добавим в конструктор начинку (тип 'main'), которая идёт четвёртой в fixture
    cy.get(`${fillingListSelector} > li:nth-child(4) > .common_button`).click();

    // Убедимся, что в количество добавленных ингредиентов в конструктор равно трём
    cy.get(`${ingredientListInConstrSelector} > li`).should('have.length', 3);
  });
});

describe('Тестирование работы модальных окон', () => {
  beforeEach(setInitialState);

  it('Открытие модального окна', () => {
    // Убедимся, что модальное окно не содержит дочерних элементов
    cy.get('#modals').should('be.empty');

    // Выполним клик по первому ингредиенту в перечне ингредиентов,
    // чтобы открыть модальное окно
    cy.get(`${bunListSelector} > li:first-child > a`).click();

    // Убедимся, что модальное окно открыто
    // (содержит дочерние элементы)
    cy.get('#modals').should('not.be.empty');

    // Убедимся, что в модальном окне отображены детали ингредиента
    cy.get('#modals')
      .should('contain', 'Детали ингредиента')
      .should('contain', 'Краторная булка N-200i')
      .should('contain', 'Калории')
      .should('contain', 'Белки')
      .should('contain', 'Жиры')
      .should('contain', 'Углеводы');
  });

  it('Закрытие модального окна по клику на крестик', () => {
    // Убедимся, что модальное окно не содержит дочерних элементов
    cy.get('#modals').should('be.empty');

    // Выполним клик по первому ингредиенту в перечне ингредиентов,
    // чтобы отобразить модальное окно
    cy.get(`${bunListSelector} > li:first-child > a`).click();

    // Убедимся, что модальное окно открыто
    cy.get('#modals').should('not.be.empty');

    // Выполним клик по крестику, чтобы закрыть модальное окно
    cy.get('#modals button').click();

    // Убедимся, что модальное окно закрыто
    // (то есть не содержит дочерних элементов)
    cy.get('#modals').should('be.empty');
  });

  it('Закрытие модального окна по клику на оверлей', () => {
    // Убедимся, что модальное окно не содержит дочерних элементов
    cy.get('#modals').should('be.empty');

    // Выполним клик по первому ингредиенту в перечне ингредиентов,
    // чтобы отобразить модальное окно
    cy.get(`${bunListSelector} > li:first-child > a`).click();

    // Убедимся, что модальное окно открыто
    cy.get('#modals').should('not.be.empty');

    // Выполним клик по оверлею, чтобы закрыть модальное окно
    //cy.get('#modals > div:last-child').click({ force: true });
    cy.get('body').click(10, 10);

    // Убедимся, что модальное окно закрыто
    cy.get('#modals').should('be.empty');
  });
});

describe('Тестирование cоздания заказа', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/orders', { fixture: 'order.json' });
    cy.intercept('GET', '/api/auth/user', { fixture: 'user.json' });
    cy.intercept('POST', '/api/auth/login', { fixture: 'user.json' });

    cy.setCookie('accessToken', 'stubAccessToken');
    cy.window()
      .its('localStorage')
      .invoke('setItem', 'refreshToken', 'stubRefreshToken');

    setInitialState();
  });

  afterEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('Собираем бургер и оформляем заказ', () => {
    // Добавим в конструктор вторую по списку булку
    cy.get(`${bunListSelector} > li:nth-child(2) > .common_button`).click();

    // Добавим в конструктор начинку (тип 'main'), которая идёт третьей в fixture
    cy.get(`${fillingListSelector} > li:nth-child(3) > .common_button`).click();

    // Добавим в конструктор соус (тип 'sauce'), который идёт первым в fixture
    cy.get(`${sauceListSelector} > li:nth-child(1) > .common_button`).click();

    // Кликнем кнопку "Оформить заказ"
    cy.get('button').contains('Оформить заказ').click();

    // Убедимся, что модальное окно открылось и номер заказа верный.
    cy.get('#modals')
      .should('not.be.empty')
      .should('contain.text', 'идентификатор заказа')
      .should('contain.text', '44769');

    // Закроем модальное окно
    cy.get('#modals button').click();
    cy.get('#modals').should('be.empty');

    // Проверим, что конструктор пуст
    cy.get('main section:nth-of-type(2)')
      .should('contain.text', 'Выберите булки')
      .should('contain.text', 'Выберите начинку');
    cy.get('main section:nth-of-type(2) > ul').find('li').should('not.exist');
  });
});
