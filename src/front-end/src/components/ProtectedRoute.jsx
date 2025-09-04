import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // 로그인하지 않았다면 로그인 페이지로 보냅니다.
    return <Navigate to="/login" replace />;
  }

  // 로그인했다면 요청한 페이지를 보여줍니다.
  return <Outlet />;
};

export default ProtectedRoute;
