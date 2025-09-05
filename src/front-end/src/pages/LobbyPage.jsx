<<<<<<< HEAD
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig.js'; // [추가] API 클라이언트를 가져옵니다.

=======
import React, { useState, useEffect, useRef } from 'react';
// useNavigate는 더 이상 필요 없으므로 삭제해도 됩니다. (Header에서 처리)
// useAuth도 더 이상 필요 없으므로 삭제합니다.
>>>>>>> abf022e6666499301240e496b6d6cb9e5c11b62b
import Loader from '@/components/Loader.jsx';
// LogoutModal은 Header로 이동했으므로 여기서 삭제합니다.
import TetrisAnimation from '@/components/TetrisAnimation';
import TetrisPlayImage from '../components/TetrisPlayImage';
import InstructionsModal from '../components/InstructionsModal';
import './pages.css';

const LobbyPage = () => {
<<<<<<< HEAD
  const [isMatching, setIsMatching] = React.useState(false);
  // [삭제] 예상 대기 시간은 실제 데이터가 아니므로 삭제합니다.
  // const [estimatedTime, setEstimatedTime] = React.useState(''); 
  const [errorMessage, setErrorMessage] = React.useState(''); // [추가] API 오류 메시지를 위한 상태
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const nickname = localStorage.getItem('username') || "게스트";

  // [수정] '매칭하기' 버튼 클릭 핸들러
  const handleMatchingClick = async () => {
    setIsMatching(true);
    setErrorMessage(''); // 이전 오류 메시지 초기화

    try {
      // 실제 백엔드 매칭 API를 호출합니다.
      const response = await apiClient.post('/matchmaking/queue', {
        gameTypeId: 1, // Tetris
      });
      
      console.log(response.data.message); // "매칭 대기열에 정상적으로 진입했습니다."
      // 성공 시, '매칭 중...' UI가 계속 표시됩니다.
      // 실제 매칭 성공 여부는 추후 WebSocket으로 받게 됩니다.

    } catch (error) {
      // API 호출 실패 시
      console.error("Failed to start matchmaking:", error);
      setErrorMessage(error.response?.data?.message || '매칭 서버에 연결할 수 없습니다.');
      setIsMatching(false); // 매칭 상태를 다시 '시작 전'으로 되돌립니다.
    }
=======
  const [isMatching, setIsMatching] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const intervalRef = useRef(null);

  const handleMatchingClick = () => {
    window.location.href = 'http://localhost:3001';
>>>>>>> abf022e6666499301240e496b6d6cb9e5c11b62b
  };

  const handleCancelMatching = async () => {
    // TODO: 백엔드에 매칭 취소 API를 호출하는 로직 추가
    // 예: await apiClient.delete('/matchmaking/queue');
    setIsMatching(false);
    console.log("매칭이 취소되었습니다.");
  };

<<<<<<< HEAD
  const handleLogout = async () => {
    try {
      await auth.logout();
      navigate('/signin');
    } catch (error) {
      console.error("Failed to logout from Lobby:", error);
=======
  useEffect(() => {
    if (isMatching) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } 
    else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
>>>>>>> abf022e6666499301240e496b6d6cb9e5c11b62b
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMatching]);

  return (
    <div className="main-container">
      <TetrisAnimation />
      {/* ↓↓↓ 이 부분의 top-right-user-info div 전체를 삭제합니다. ↓↓↓ */}

      <div className="content-box">
        {isMatching ? (
          <div className="matching-content">
            <Loader />
<<<<<<< HEAD
            <p className="matching-text">상대를 찾는 중입니다...</p>
            {/* [삭제] 가짜 예상 대기 시간을 제거하고 심플하게 변경합니다. */}
=======
            <p className="matching-text">매칭하는 중...</p>
            <p className="wait-time-text">대기 시간 : {elapsedTime}초</p>
>>>>>>> abf022e6666499301240e496b6d6cb9e5c11b62b
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
            {/* [추가] 오류 메시지가 있을 경우에만 표시합니다. */}
            {errorMessage && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMessage}</p>}
          </div>
        )}
      </div>
<<<<<<< HEAD
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
=======

      <div className="bottom-right-container">
          <button className="instructions-button" onClick={() => setShowInstructionsModal(true)}>
              게임설명서
          </button>
      </div>
      
      {/* ↓↓↓ 이 부분의 showLogoutModal 및 LogoutModal 렌더링 부분을 삭제합니다. ↓↓↓
      */}

      {showInstructionsModal && (
        <InstructionsModal onClose={() => setShowInstructionsModal(false)} />
>>>>>>> abf022e6666499301240e496b6d6cb9e5c11b62b
      )}
    </div>
  );
};

<<<<<<< HEAD
export default LobbyPage;
=======
export default LobbyPage;
>>>>>>> abf022e6666499301240e496b6d6cb9e5c11b62b
