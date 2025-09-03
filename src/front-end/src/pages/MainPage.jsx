import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TetrisAnimation from '@/components/TetrisAnimation';
import './Pages.css'; // 스타일을 위한 CSS 파일

const MainPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/signin'); // '/signin' 경로로 이동
  };

  const handleSignupClick = () => {
    navigate('/signup'); // '/signup' 경로로 이동
  };

  return (
    <div className="main-container">
      <TetrisAnimation />
      <div className="content-box">
        <h1 className="title">Tetris Battle</h1>
        <p className="subtitle">실시간 테트리스 대전</p>
        <div className="button-group">
          <button className="main-button login" onClick={handleLoginClick}>
            로그인
          </button>
          <button className="main-button signup" onClick={handleSignupClick}>
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;