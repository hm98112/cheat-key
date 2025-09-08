import React from 'react';
// ⭐️ 1. BrowserRouter는 index.js나 Main.jsx로 옮기는 것이 일반적이지만,
//    현재 구조를 유지하기 위해 useLocation만 추가로 import 합니다.
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

// ⭐️ 2. App 컴포넌트 내부에서 라우팅 관련 로직을 처리하기 위해
//    실제 내용을 별도의 Layout 컴포넌트로 분리합니다.
function AppLayout() {
  const location = useLocation();

  // ⭐️ 3. 현재 URL 경로가 '/tetris/'로 시작하는지 확인합니다.
  //    게임 페이지 경로가 '/tetris/:gameId'이므로, 이 조건으로 게임 페이지만 정확히 찾아냅니다.
  const showHeader = !location.pathname.startsWith('/tetris/');

  return (
    <>
      {/* ⭐️ 4. showHeader가 true일 때만 Header 컴포넌트를 렌더링합니다. */}
      {showHeader && <Header />}

      <main className="main-content">
        <Routes>
          {/* --- 공개 라우트 (로그인 안 한 사용자만) --- */}
          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<SigninPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<MainPage />} />
          </Route>

          {/* --- 보호된 라우트 (로그인 한 사용자만) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/tetris/:gameId" element={<TetrisPage />} />
          </Route>
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* ⭐️ 실제 레이아웃과 라우팅을 담당하는 컴포넌트를 호출합니다. */}
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;