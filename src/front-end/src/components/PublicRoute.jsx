import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // AuthContext에서 로그인 상태를 가져옵니다.

const PublicRoute = () => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    // 만약 이미 로그인한 상태라면,
    // 로그인/회원가입 페이지 대신 로비 페이지로 보냅니다.
    return <Navigate to="/lobby" replace />;
  }

  // 로그인하지 않은 상태라면, 요청한 페이지(로그인/회원가입)를 정상적으로 보여줍니다.
  return <Outlet />;
};

export default PublicRoute;
