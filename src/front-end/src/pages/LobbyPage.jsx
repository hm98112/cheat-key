import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig.js'; 
import Loader from '@/components/Loader.jsx';
import TetrisAnimation from '@/components/TetrisAnimation';
import TetrisPlayImage from '../components/TetrisPlayImage';
import InstructionsModal from '../components/InstructionsModal';
import './pages.css';

const LobbyPage = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const auth = useAuth();

  const nickname = localStorage.getItem('username') || "게스트";

  const handleMatchingClick = async () => {
    setIsMatching(true);
    setErrorMessage('');

    try {
      const response = await apiClient.post('/matchmaking/queue', {
        gameTypeId: 1, // Tetris
      });
      console.log(response.data.message);
      // 이후 WebSocket으로 매칭 성공 처리 예정
    } catch (error) {
      console.error("Failed to start matchmaking:", error);
      setErrorMessage(error.response?.data?.message || '매칭 서버에 연결할 수 없습니다.');
      setIsMatching(false);
    }
  };

  const handleCancelMatching = () => {
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

  useEffect(() => {
    if (isMatching) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setElapsedTime(0); // 매칭 취소시 시간 초기화도 고려
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
      <div className="content-box">
        {isMatching ? (
          <div className="matching-content">
            <Loader />
            <p className="matching-text">상대를 찾는 중입니다...</p>
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
            {errorMessage && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMessage}</p>}
          </div>
        )}
      </div>
      <div className="bottom-right-container">
        <button className="instructions-button" onClick={() => setShowInstructionsModal(true)}>
          게임설명서
        </button>
      </div>
      {showInstructionsModal && (
        <InstructionsModal onClose={() => setShowInstructionsModal(false)} />
      )}
    </div>
  );
};

export default LobbyPage;