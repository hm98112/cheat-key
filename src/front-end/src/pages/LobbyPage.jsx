import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig.js'; // [추가] API 클라이언트를 가져옵니다.

import Loader from '@/components/Loader.jsx';
import LogoutModal from '@/components/LogoutModal.jsx';
import TetrisAnimation from '@/components/TetrisAnimation';
import TetrisPlayImage from '../components/TetrisPlayImage';
import './pages.css';

const LobbyPage = () => {
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
  };

  const handleCancelMatching = async () => {
    // TODO: 백엔드에 매칭 취소 API를 호출하는 로직 추가
    // 예: await apiClient.delete('/matchmaking/queue');
    setIsMatching(false);
    console.log("매칭이 취소되었습니다.");
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
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
            <p className="matching-text">상대를 찾는 중입니다...</p>
            {/* [삭제] 가짜 예상 대기 시간을 제거하고 심플하게 변경합니다. */}
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
