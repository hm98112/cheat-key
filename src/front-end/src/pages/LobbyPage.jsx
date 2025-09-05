import React, { useState, useEffect, useRef } from 'react';
// useNavigate는 더 이상 필요 없으므로 삭제해도 됩니다. (Header에서 처리)
// useAuth도 더 이상 필요 없으므로 삭제합니다.
import Loader from '@/components/Loader.jsx';
// LogoutModal은 Header로 이동했으므로 여기서 삭제합니다.
import TetrisAnimation from '@/components/TetrisAnimation';
import TetrisPlayImage from '../components/TetrisPlayImage';
import InstructionsModal from '../components/InstructionsModal';
import './pages.css';

const LobbyPage = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const intervalRef = useRef(null);

  const handleMatchingClick = () => {
    window.location.href = 'http://localhost:3001';
  };

  const handleCancelMatching = () => {
    setIsMatching(false);
  };

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
            <p className="matching-text">매칭하는 중...</p>
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
      
      {/* ↓↓↓ 이 부분의 showLogoutModal 및 LogoutModal 렌더링 부분을 삭제합니다. ↓↓↓
      */}

      {showInstructionsModal && (
        <InstructionsModal onClose={() => setShowInstructionsModal(false)} />
      )}
    </div>
  );
};

export default LobbyPage;