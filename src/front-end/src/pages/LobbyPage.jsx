import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';

// 컴포넌트들을 가져옵니다.
import Loader from '@/components/Loader.jsx';
import TetrisAnimation from '@/components/TetrisAnimation';
import TetrisPlayImage from '../components/TetrisPlayImage';
import InstructionsModal from '../components/InstructionsModal'; // 게임 설명서 모달
=======
import { useAuth } from '../context/AuthContext'; // useAuth 훅만 사용합니다.
import apiClient from '../api/axiosConfig';

import Loader from '@/components/Loader.jsx';
import TetrisAnimation from '@/components/TetrisAnimation';
import TetrisPlayImage from '../components/TetrisPlayImage';
import InstructionsModal from '../components/InstructionsModal';
>>>>>>> origin/back-end
import './pages.css';


const LobbyPage = () => {
<<<<<<< HEAD
  const [isMatching, setIsMatching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0); // 매칭 경과 시간
  const [showInstructionsModal, setShowInstructionsModal] = useState(false); // [추가]
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const { token } = useAuth();

  

  // Socket.IO 연결 및 이벤트 리스너를 관리하는 useEffect
  useEffect(() => {
    
    if (!token) {
      console.error('[Socket.IO] 연결 실패: 인증 토큰이 없습니다.');
      return;
    }
    // 서버의 인증 방식에 맞게 'auth' 옵션으로 토큰을 전송합니다.
    const socket = io('http://localhost:8080', {
      auth: {
        token: token  
      }
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
  }, [navigate, token]);

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
=======
    const [isMatching, setIsMatching] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);
    const intervalRef = useRef(null);
    const navigate = useNavigate();
    
    // 1. useAuth 훅을 한 번만 호출하여 필요한 모든 값을 ㅛ   // 1. useAuth 훅을 한 번만 호출하여 필요한 모든 값을 ㅛ가져옵니다.
    const { socket } = useAuth();

    // 2. 소켓 관련 로직은 이 하나의 useEffect에서만 처리합니다.
    useEffect(() => {
        // AuthContext가 소켓을 아직 생성하지 않았으면 아무것도 하지 않습니다.
        if (!socket) {
            console.log('[LobbyPage] 소켓을 기다리는 중...');
            return;
        }

        console.log(`[LobbyPage] 전역 소켓을 사용합니다 (ID: ${socket.id})`);

        // 이벤트 핸들러를 외부 함수로 분리하여 .off()에서 참조할 수 있도록 합니다.
        const handleMatchSuccess = (data) => {
            console.log('[Socket.IO] 매칭 성공!', data);
            setIsMatching(false);
            const { gameId } = data;
            navigate(`/tetris/${gameId}`);
        };

        // 전역 소켓에 이벤트 리스너를 등록합니다.
        socket.on('matchSuccess', handleMatchSuccess);

        // 클린업(Cleanup) 함수: LobbyPage를 떠날 때 실행됩니다.
        return () => {
            console.log('[LobbyPage] 클린업: matchSuccess 리스너를 제거합니다.');
            // ★ 중요: disconnect()가 아니라, 이 페이지에서 등록한 이벤트 리스너만 제거합니다.
            socket.off('matchSuccess', handleMatchSuccess);
        };
    }, [socket, navigate]); // socket 객체가 준비되면 이 useEffect가 실행됩니다.

    // 매칭 경과 시간 타이머 useEffect (변경 없음)
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
            // 매칭 요청 시, 서버는 이미 소켓을 통해 사용자를 알고 있습니다.
            await apiClient.post('/matchmaking/queue', { gameTypeId: 1 });
        } catch (error) {
            console.error("매칭 시작 실패:", error);
            setErrorMessage(error.response?.data?.message || '매칭 서버에 연결할 수 없습니다.');
            setIsMatching(false);
        }
    };

    const handleCancelMatching = async () => {
        setIsMatching(false);
        // TODO: 백엔드에 매칭 취소 API 호출
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
            {showInstructionsModal && <InstructionsModal onClose={() => setShowInstructionsModal(false)} />}
        </div>
    );
>>>>>>> origin/back-end
};

export default LobbyPage;

