// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Header from './components/Header';

import MainPage from './pages/MainPage';
import SigninPage from './pages/SigninPage';
import SignupPage from './pages/SignupPage';
import LobbyPage from './pages/LobbyPage';
import NotFound from './pages/NotFound';
import TetrisPage from './pages/TetrisPage';

/**
 * Layout 컴포넌트는 페이지의 공통 구조(헤더, 메인 콘텐츠)를 담당합니다.
 * useLocation 훅을 사용하여 현재 URL에 따라 헤더를 보여줄지 결정합니다.
 */
function Layout() {
  const location = useLocation();
  // 현재 URL 경로가 '/tetris/' 로 시작하면 헤더를 보여주지 않습니다.
  const showHeader = !location.pathname.startsWith('/tetris/');

  return (
    <>
      {showHeader && <Header />}
      <main className="main-content">
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<SigninPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<MainPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/tetris/:gameId" element={<TetrisPage />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

/**
 * App 컴포넌트는 앱의 최상위 래퍼(Wrapper) 역할을 합니다.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;