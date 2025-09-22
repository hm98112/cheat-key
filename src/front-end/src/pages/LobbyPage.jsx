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
    
    // 랭킹 관련 상태 변수들
    const [showRankingModal, setShowRankingModal] = useState(false);
    const [rankings, setRankings] = useState([]);
    const [rankingError, setRankingError] = useState('');
    const [isRankingLoading, setIsRankingLoading] = useState(false); // 로딩 상태 추가

    const intervalRef = useRef(null);
    const navigate = useNavigate();
    const { socket } = useAuth();

    // 경합 조건 방지를 위한 ref 추가 
    // 이유: useEffect의 클로저(closure) 환경에서도 항상 최신 isMatching 상태를 참조하기 위함
    //       이를 통해 소켓 이벤트 핸들러가 오래된 상태 값을 사용하는 것을 방지합
    const isMatchingRef = useRef(isMatching);
    useEffect(() => {
        isMatchingRef.current = isMatching;
    }, [isMatching]);
    
    // 소켓 관련 로직 useEffect
    useEffect(() => {
        if (!socket) {
            console.log('[LobbyPage] 소켓을 기다리는 중...');
            return;
        }

        console.log(`[LobbyPage] 전역 소켓을 사용합니다 (ID: ${socket.id})`);

        const handleMatchSuccess = (data) => {
            if (!isMatchingRef.current) {
                console.log('[Socket.IO] 매칭 성공 이벤트를 받았으나, 사용자가 이미 취소하여 무시합니다.');
                return;
            }
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
        try {
            await apiClient.delete('/matchmaking/queue', { 
                data: { gameTypeId: 1 }
            });
            console.log("매칭이 성공적으로 취소되었습니다.");
            setIsMatching(false);
        } catch (error) {
            console.error("매칭 취소 실패:", error);
            setErrorMessage(error.response?.data?.message || '매칭 취소를 처리하는 중 오류가 발생했습니다.');
        }
    };

    // '랭킹 보기' 버튼 핸들러
    const handleRankingClick = async () => {
        setIsRankingLoading(true); // 로딩 시작
        setRankingError('');
        setShowRankingModal(true); // 모달을 즉시 띄웁니다.
        try {
            const response = await apiClient.get('/ranking');
            setRankings(response.data);
        } catch (error) {
            console.error("랭킹 조회 실패:", error);
            setRankingError('랭킹을 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
        } finally {
            setIsRankingLoading(false); // 로딩 종료
        }
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
            
            {showRankingModal && (
                <RankingModal
                    rankings={rankings}
                    error={rankingError}
                    isLoading={isRankingLoading} // 로딩 상태를 props로 전달
                    onClose={() => setShowRankingModal(false)}
                />
            )}
        </div>
    );
};

export default LobbyPage;