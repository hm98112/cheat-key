import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';

import Loader from '@/components/Loader.jsx';
import TetrisAnimation from '@/components/TetrisAnimation';
import TetrisPlayImage from '../components/TetrisPlayImage';
import InstructionsModal from '../components/InstructionsModal';
import RankingModal from '../components/RankingModal'; // 랭킹 모달 컴포넌트 import
import './pages.css';

const LobbyPage = () => {
    const [isMatching, setIsMatching] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);
    
    // --- START: 랭킹 관련 상태 변수 추가 ---
    const [showRankingModal, setShowRankingModal] = useState(false);
    const [rankings, setRankings] = useState([]);
    const [rankingError, setRankingError] = useState('');
    // --- END: 랭킹 관련 상태 변수 추가 ---

    const intervalRef = useRef(null);
    const navigate = useNavigate();
    const { socket } = useAuth();

    // 소켓 관련 로직 useEffect
    useEffect(() => {
        if (!socket) {
            console.log('[LobbyPage] 소켓을 기다리는 중...');
            return;
        }

        console.log(`[LobbyPage] 전역 소켓을 사용합니다 (ID: ${socket.id})`);

        const handleMatchSuccess = (data) => {
            console.log('[Socket.IO] 매칭 성공!', data);
            setIsMatching(false);
            const { gameId } = data;
            navigate(`/tetris/${gameId}`);
        };

        socket.on('matchSuccess', handleMatchSuccess);

        return () => {
            console.log('[LobbyPage] 클린업: matchSuccess 리스너를 제거합니다.');
            socket.off('matchSuccess', handleMatchSuccess);
        };
    }, [socket, navigate]);

    // 매칭 경과 시간 타이머 useEffect
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

    // '매칭하기' 버튼 핸들러
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

    // '매칭 취소' 버튼 핸들러
    const handleCancelMatching = async () => {
        setIsMatching(false);
        // TODO: 백엔드에 매칭 취소 API 호출
        console.log("매칭이 취소되었습니다.");
    };

    // --- START: '랭킹 보기' 버튼 핸들러 추가 ---
    const handleRankingClick = async () => {
        try {
            setRankingError(''); // 이전 에러 메시지 초기화
            const response = await apiClient.get('/ranking');
            setRankings(response.data);
            setShowRankingModal(true); // 모달 띄우기
        } catch (error) {
            console.error("랭킹 조회 실패:", error);
            setRankingError('랭킹을 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
            setShowRankingModal(true); // 에러가 발생해도 모달은 띄워서 메시지를 보여줍니다.
        }
    };
    // --- END: '랭킹 보기' 버튼 핸들러 추가 ---

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
                        <div className="lobby-button-group">
                            <button className="main-button login" onClick={handleMatchingClick}>
                                매칭하기
                            </button>
                            <button className="main-button secondary" onClick={handleRankingClick}>
                                랭킹 보기
                            </button>
                        </div>
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
            
            {/* --- START: 랭킹 모달 렌더링 추가 --- */}
            {showRankingModal && (
                <RankingModal
                    rankings={rankings}
                    error={rankingError}
                    onClose={() => setShowRankingModal(false)}
                />
            )}
            {/* --- END: 랭킹 모달 렌더링 추가 --- */}
        </div>
    );
};

export default LobbyPage;
