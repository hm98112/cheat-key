import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. 필요한 컴포넌트들을 모두 가져옵니다.
import { AuthProvider } from './context/AuthContext'; // 인증 상태를 제공하는 Provider
import ProtectedRoute from './components/ProtectedRoute'; // 경비원 컴포넌트
import PublicRoute from './components/PublicRoute'; // 안내원 컴포넌트

// 2. 각 URL 경로에서 보여줄 페이지 컴포넌트들을 가져옵니다.
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage.jsx';
// 파일 이름에 오타가 있을 수 있으니 확인해주세요 (SingupPage -> SignupPage)
import SignupPage from './pages/SignupPage.jsx'; 
import LobbyPage from './pages/LobbyPage';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    // 3. AuthProvider로 전체 앱을 감싸서, 모든 컴포넌트가 로그인 상태를 알 수 있게 합니다.
    <AuthProvider>
      <BrowserRouter>
        {/* 모든 Route는 반드시 단 하나의 Routes 컴포넌트 안에 있어야 합니다. */}
        <Routes>
          {/* --- 그룹 1: 로그인하지 않은 사용자만 접근 가능한 라우트 --- */}
          {/* PublicRoute 안내원이 이 경로들을 지킵니다. */}
          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* --- 그룹 2: 로그인한 사용자만 접근 가능한 라우트 --- */}
          {/* ProtectedRoute 경비원이 이 경로들을 지킵니다. */}
          <Route element={<ProtectedRoute />}>
            <Route path="/lobby" element={<LobbyPage />} />
            {/* <Route path="/my-page" element={<MyPage />} /> */}
          </Route>
          
          {/* --- 그룹 3: 항상 접근 가능한 라우트 --- */}
          {/* 메인 페이지는 어떤 문에도 속하지 않아 누구나 접근 가능합니다. */}
          <Route path="/" element={<MainPage />} />
        
          {/* --- 404 Not Found --- */}
          {/* 위에서 일치하는 경로가 없을 경우, 이 페이지를 보여줍니다. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

