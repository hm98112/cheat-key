// frontend/src/App.jsx

import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import tetrisBgm from './assets/tetris-bgm.mp3'; // BGM 파일 경로

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Header from './components/Header';

import MainPage from './pages/MainPage';
import SigninPage from './pages/SigninPage';
import SignupPage from './pages/SignupPage';
import LobbyPage from './pages/LobbyPage';
import NotFound from './pages/NotFound';
import TetrisPage from './pages/TetrisPage'; // TetrisPage import 추가

/**
 * @file App.jsx
 * @brief 애플리케이션의 최상위 라우팅 및 전역 레이아웃, BGM을 관리하는 컴포넌트입니다.
 */

/**
 * Layout 컴포넌트는 페이지의 공통 구조(헤더, 메인 콘텐츠)를 담당합니다.
 * useLocation 훅을 사용하여 현재 URL 경로에 따라 헤더를 보여줄지 결정합니다.
 */
function Layout() {
  const location = useLocation();
  // TetrisPage에서는 게임에 집중할 수 있도록 Header를 숨깁니다.
  const showHeader = !location.pathname.startsWith('/tetris/');

  return (
    <>
      {showHeader && <Header />}
      <main className="main-content">
        <Routes>
          {/* --- 공개 라우트 (로그인 안 한 사용자만 접근 가능) --- */}
          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<SigninPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<MainPage />} />
          </Route>

          {/* --- 보호된 라우트 (로그인 한 사용자만 접근 가능) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/tetris/:gameId" element={<TetrisPage />} />
          </Route>
          
          {/* --- 일치하는 경로가 없을 경우 --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

/**
 * App 컴포넌트는 앱의 최상위 래퍼(Wrapper) 역할을 합니다.
 * 배경 음악과 같이 모든 페이지에 걸쳐 유지되어야 하는 전역적인 요소를 관리합니다.
 */
function App() {
  const audioRef = useRef(null);

  // 브라우저의 자동 재생 정책 때문에, 사용자의 첫 상호작용(클릭, 키 입력 등)이 있을 때
  // 음악을 재생하도록 처리합니다.
  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(error => {
          console.log('사용자 상호작용이 필요하여 자동 재생이 차단되었습니다:', error);
        });
      }
      // 음악이 한번 재생 시작되면, 이벤트 리스너는 더 이상 필요 없으므로 제거하여 성능을 최적화합니다.
      document.removeEventListener('click', playAudio);
      document.removeEventListener('keydown', playAudio);
    };

    document.addEventListener('click', playAudio);
    document.addEventListener('keydown', playAudio);

    // 컴포넌트가 사라질 때(unmount) 등록했던 이벤트 리스너를 깨끗하게 정리합니다.
    return () => {
      document.removeEventListener('click', playAudio);
      document.removeEventListener('keydown', playAudio);
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Layout 컴포넌트가 페이지의 시각적인 UI를 모두 렌더링합니다. */}
        <Layout />
        
        {/* audio 태그는 Layout 컴포넌트 외부에 두어 UI 레이아웃에 전혀 영향을 주지 않도록 합니다. */}
        {/* style={{ display: 'none' }} 속성으로 만일의 경우에도 보이지 않도록 처리합니다. */}
        <audio ref={audioRef} src={tetrisBgm} loop style={{ display: 'none' }} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
