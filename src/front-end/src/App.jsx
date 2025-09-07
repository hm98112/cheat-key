import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. 필요한 모든 컴포넌트들을 가져옵니다.
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Header from './components/Header';

// 2. 각 URL 경로에서 보여줄 페이지 컴포넌트들을 가져옵니다.
import MainPage from './pages/MainPage';
import SigninPage from './pages/SigninPage';
import SignupPage from './pages/SignupPage';
import LobbyPage from './pages/LobbyPage';
import NotFound from './pages/NotFound';
import TetrisPage from './pages/TestrisPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* ⭐ Header는 Routes 밖에 위치하여 어떤 페이지로 이동하든 항상 보입니다. */}
        <Header />
        
        {/* 페이지의 메인 콘텐츠를 감싸는 영역 */}
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
              {/* <Route path="/my-page" element={<MyPage />} /> */}
              <Route path="/tetris/:gameId" element={<TetrisPage />} />
            </Route>
            
            {/* --- 항상 접근 가능한 라우트 --- */}
                    
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

