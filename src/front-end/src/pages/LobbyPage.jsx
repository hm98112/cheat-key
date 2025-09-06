import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';

// 컴포넌트들을 가져옵니다.
import Loader from '@/components/Loader.jsx';
import TetrisAnimation from '@/components/TetrisAnimation';
import TetrisPlayImage from '../components/TetrisPlayImage';
import InstructionsModal from '../components/InstructionsModal'; // [추가] 게임 설명서 모달
import './pages.css';


const LobbyPage = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0); // 매칭 경과 시간
  const [showInstructionsModal, setShowInstructionsModal] = useState(false); // [추가]
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const auth = useAuth();
  const userId = localStorage.getItem('userId');
  console.log(`[DEBUG] LobbyPage 렌더링. localStorage에서 가져온 userId: ${userId}`);

  // Socket.IO 연결 및 이벤트 리스너를 관리하는 useEffect
  useEffect(() => {
    if (!userId) return; // userId가 없으면 연결하지 않습니다.
    // 1. 컴포넌트가 마운트되면 즉시 소켓에 연결합니다.
    console.log(`[DEBUG] useEffect 실행. 이 userId ('${userId}')로 소켓 연결을 시도합니다.`);

    const socket = io('http://localhost:8080', {
      query: { userId }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[Socket.IO] 서버에 연결되었습니다 (ID: ${socket.id})`);
    });

    socket.on('matchSuccess', (data) => {
      console.log('[Socket.IO] 매칭 성공!', data);
      setIsMatching(false); // 매칭 상태를 비활성화합니다.
      const { gameId } = data;
      navigate(`/tetris/${gameId}`); // 게임 페이지로 이동
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] 서버와의 연결이 끊어졌습니다.');
    });

    // 2. 컴포넌트가 언마운트될 때(사용자가 로비 페이지를 떠날 때) 연결을 끊습니다.
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId, navigate]);

  // 매칭 경과 시간을 측정하는 타이머 useEffect
  useEffect(() => {
    if (isMatching) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      setElapsedTime(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [isMatching]);


  const handleMatchingClick = async () => {
    setIsMatching(true);
    setErrorMessage('');
    try {
      await apiClient.post('/matchmaking/queue', { gameTypeId: 1 });
    } catch (error) {
      console.error("매칭 시작 실패:", error);
      setErrorMessage(error.response?.data?.message || '매칭 서버에 연결할 수 없습니다.');
      setIsMatching(false);
    }
  };

  const handleCancelMatching = async () => {
    // TODO: 백엔드에 매칭 취소 API 호출 로직 추가 필요
    setIsMatching(false);
    console.log("매칭이 취소되었습니다.");
  };



  return (
    <div className="main-container">
      <TetrisAnimation />
      <div className="content-box">
        {isMatching ? (
          <div className="matching-content">
            <Loader />
            <p className="matching-text">상대를 찾는 중입니다...</p>
            {/* [추가] 경과 시간 표시 */}
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
      {/* [추가] 게임 설명서 버튼 */}
      <div className="bottom-right-container">
        <button className="instructions-button" onClick={() => setShowInstructionsModal(true)}>
          게임설명서
        </button>
      </div>
      {/* 모달 렌더링 */}
      {showInstructionsModal && <InstructionsModal onClose={() => setShowInstructionsModal(false)} />}
    </div>
  );
};

export default LobbyPage;

