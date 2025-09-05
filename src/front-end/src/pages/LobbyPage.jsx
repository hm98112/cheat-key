import React, { useState, useEffect, useRef } from 'react'; // useEffect, useRef 임포트 추가
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ⭐ AuthContext를 가져옵니다.
import Loader from '@/components/Loader.jsx';
import LogoutModal from '@/components/LogoutModal.jsx';
import TetrisAnimation from '@/components/TetrisAnimation';
import TetrisPlayImage from '../components/TetrisPlayImage';
import InstructionsModal from '../components/InstructionsModal';
import './pages.css';

const LobbyPage = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // 'elapsedTime' 상태 추가 (경과 시간)
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth(); // ⭐ AuthContext의 기능을 사용합니다.

  const nickname = localStorage.getItem('username') || "게스트";

  const handleMatchingClick = () => {
    setIsMatching(true);
    setElapsedTime(0); // 매칭 시작 시 경과 시간을 0으로 초기화
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

  // isMatching 상태가 변경될 때마다 타이머를 제어하는 useEffect
  useEffect(() => {
    // isMatching이 true일 때 (매칭 시작)
    if (isMatching) {
      // 1초마다 elapsedTime을 1씩 증가시키는 interval 시작
      intervalRef.current = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } 
    // isMatching이 false일 때 (매칭 취소 또는 초기 상태)
    else {
      // 실행 중인 interval이 있으면 정지시킴
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    // 컴포넌트가 언마운트될 때 interval을 정리하는 cleanup 함수
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMatching]); // isMatching 상태가 바뀔 때만 이 effect가 실행됩니다.

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
            {/* 'estimatedTime' 대신 'elapsedTime' 상태를 사용 */}
            <p className="wait-time-text">대기 시간 : {elapsedTime}초</p>
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

      <div className="bottom-right-container">
          <button className="instructions-button" onClick={() => setShowInstructionsModal(true)}>
              게임설명서
          </button>
      </div>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      {showInstructionsModal && (
        <InstructionsModal onClose={() => setShowInstructionsModal(false)} />
      )}
    </div>
  );
};

export default LobbyPage;

