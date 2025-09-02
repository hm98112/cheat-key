import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage.jsx'; // 이전 단계에서 만든 파일
import SignupPage from './pages/SingupPage.jsx'; // 이전 단계에서 만든 파일

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* 다른 페이지 라우트들을 여기에 추가할 수 있습니다. */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;