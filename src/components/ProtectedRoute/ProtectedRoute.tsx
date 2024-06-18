import { useSelector } from '../../services/store';
import { isAuthCheckedSelector, userSelector } from '@slices';
import { Navigate, useLocation } from 'react-router';
import { Preloader } from '@ui';

type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: React.ReactElement;
};

export const ProtectedRoute = ({
  onlyUnAuth,
  children
}: ProtectedRouteProps) => {
  // isAuthCheckedSelector — селектор получения состояния загрузки пользователя
  const isAuthChecked = useSelector(isAuthCheckedSelector);

  // userDataSelector — селектор получения пользователя из store
  const user = useSelector(userSelector);

  const location = useLocation();

  // пока идёт чекаут пользователя, показываем прелоадер
  if (!isAuthChecked) {
    return <Preloader />;
  }

  // если пользователь на странице авторизации и данных в хранилище нет,
  // то делаем редирект
  if (!onlyUnAuth && !user) {
    // в поле from объекта location.state записываем информацию о URL
    return <Navigate replace to='/login' state={{ from: location }} />;
  }

  // если пользователь на странице авторизации и данные есть в хранилище
  if (onlyUnAuth && user) {
    // при обратном редиректе получаем данные о месте назначения редиректа
    // из объекта location.state
    // в случае если объекта location.state?.from нет — а такое может быть,
    // когда мы зашли на страницу логина по прямому URL, то
    // мы сами создаём объект c указанием адреса
    // и делаем переадресацию на главную страницу
    const from = location.state?.from || { pathname: '/' };

    return <Navigate replace to={from} />;
  }

  return children;
};
