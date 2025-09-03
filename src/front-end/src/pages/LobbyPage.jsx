import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/Loader.jsx';
import LogoutModal from '@/components/LogoutModal.jsx';
import TetrisAnimation from '@/components/TetrisAnimation';
import './pages.css';

const LobbyPage = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  
  // 실제로는 로그인 시 받아온 닉네임을 사용해야 합니다.
  const nickname = "테트리스고수"; 

  const handleMatchingClick = () => {
    setIsMatching(true);
    // 10초에서 5분(300초) 사이의 랜덤 시간 계산
    const randomSeconds = Math.floor(Math.random() * (300 - 10 + 1)) + 10;
    const minutes = Math.floor(randomSeconds / 60);
    const seconds = randomSeconds % 60;
    
    if (minutes > 0) {
      setEstimatedTime(`${minutes}분 ${seconds}초`);
    } else {
      setEstimatedTime(`${seconds}초`);
    }
  };

  const handleLogout = () => {
    // 로그아웃 로직 실행 후 메인 페이지로 이동
    console.log("로그아웃 되었습니다.");
    navigate('/');
  };

  return (
    <div className="main-container">
      <TetrisAnimation />
      {/* 우측 상단 닉네임 및 로그아웃 버튼 */}
      <div className="top-right-user-info">
        <span className="nickname">{nickname}</span>
        <button className="logout-button" onClick={() => setShowLogoutModal(true)}>
          로그아웃
        </button>
      </div>

      <div className="content-box">
        {isMatching ? (
          <div className="matching-content">
            <Loader />
            <p className="matching-text">매칭하는 중...</p>
            <p className="wait-time-text">예상 대기 시간 : {estimatedTime}</p>
          </div>
        ) : (
          <div className="lobby-content">
            {/*  */}
            <img 
              src="https://i.imgur.com/3Z6kY9r.png" 
              alt="테트리스 플레이 이미지" 
              className="tetris-image"
            />
            <button className="main-button login" onClick={handleMatchingClick}>
              매칭하기
            </button>
          </div>
        )}
      </div>

      {/* 로그아웃 모달 */}
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
};

export default LobbyPage;