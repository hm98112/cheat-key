import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ⭐ AuthContext를 가져옵니다.
import Loader from '@/components/Loader.jsx';
import LogoutModal from '@/components/LogoutModal.jsx';
import TetrisAnimation from '@/components/TetrisAnimation';
import TetrisPlayImage from '../components/TetrisPlayImage';
import './pages.css';

const LobbyPage = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth(); // ⭐ AuthContext의 기능을 사용합니다.

  const nickname = localStorage.getItem('username') || "게스트";

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

  const handleCancelMatching = () => {
    setIsMatching(false);
  };

  /**
   * ⭐ 수정된 로그아웃 핸들러
   * AuthContext의 공식 로그아웃 절차를 따릅니다.
   */
  const handleLogout = async () => {
    try {
      await auth.logout();
      // 로그아웃 성공 후, App.jsx에 정의된 /signin 경로로 이동합니다.
      navigate('/signin');
    } catch (error) {
      console.error("Failed to logout from Lobby:", error);
    }
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
            <button className="main-button secondary cancel-matching" onClick={handleCancelMatching}>
              매칭 취소
            </button>
          </div>
        ) : (
          <div className="lobby-content">
            <TetrisPlayImage />
            <button className="main-button login" onClick={handleMatchingClick}>
              매칭하기
            </button>
          </div>
        )}
      </div>
      {/* LogoutModal은 이제 수정된 handleLogout 함수를 사용합니다. */}
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

