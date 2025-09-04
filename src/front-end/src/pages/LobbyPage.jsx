import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/Loader.jsx';
import LogoutModal from '@/components/LogoutModal.jsx';
import TetrisAnimation from '@/components/TetrisAnimation';
import TetrisPlayImage from '../components/TetrisPlayImage'; // TetrisPlayImage 컴포넌트를 임포트합니다.
import './pages.css';

const LobbyPage = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const nickname = localStorage.getItem('username') || "게스트";

  // '매칭하기' 버튼 클릭 시 실행될 함수
  const handleMatchingClick = () => {
    setIsMatching(true);
    const randomSeconds = Math.floor(Math.random() * (300 - 10 + 1)) + 10;
    const minutes = Math.floor(randomSeconds / 60);
    const seconds = randomSeconds % 60;

    if (minutes > 0) {
      setEstimatedTime(`${minutes}분 ${seconds}초`);
    } else {
      setEstimatedTime(`${seconds}초`);
    }
  };

  // ✨ "매칭 취소" 버튼 클릭 시 실행될 함수
  const handleCancelMatching = () => {
    setIsMatching(false); // 매칭 상태를 false로 변경하여 로비 화면으로 되돌립니다.
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    console.log("로그아웃 되었습니다.");
    navigate('/');
  };

  return (
    <div className="main-container">
      <TetrisAnimation />
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
            {/* ✨ 매칭 취소 버튼 추가 */}
            <button className="main-button secondary cancel-matching" onClick={handleCancelMatching}>
              매칭 취소
            </button>
          </div>
        ) : (
          <div className="lobby-content">
            {/* ✨ 기존 img 태그를 TetrisPlayImage 컴포넌트로 교체 */}
            <TetrisPlayImage />
            <button className="main-button login" onClick={handleMatchingClick}>
              매칭하기
            </button>
          </div>
        )}
      </div>
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