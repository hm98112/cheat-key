import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // useAuth 훅만 사용합니다.
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
