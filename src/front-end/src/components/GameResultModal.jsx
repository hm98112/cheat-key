import React from 'react';
import './components.css'; // 모달 스타일링을 위한 CSS

const GameResultModal = ({ isOpen, result, countdown }) => {
    if (!isOpen) {
        return null;
    }

    const { oldRating, newRating, ratingChange } = result;
    const isWin = ratingChange >= 0;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>게임 종료!</h2>
                <div className="rating-info">
                    <p>이전 레이팅: {oldRating}</p>
                    <p className={isWin ? 'rating-up' : 'rating-down'}>
                        레이팅 변화: {isWin ? '+' : ''}{ratingChange}
                    </p>
                    <h3>최종 레이팅: {newRating}</h3>
                </div>
                <p className="countdown-message">
                    {countdown}초 후에 로비로 이동합니다...
                </p>
            </div>
        </div>
    );
};

export default GameResultModal;