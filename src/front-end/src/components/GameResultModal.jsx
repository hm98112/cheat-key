import React from 'react'; // React 라이브러리 임포트
import './components.css'; // 모달 스타일링을 위한 CSS

// 게임 결과 모달 컴포넌트 정의
const GameResultModal = ({ isOpen, result, countdown }) => {
    // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
    if (!isOpen) {
        return null;
    }

    // result 객체에서 레이팅 정보 추출
    const { oldRating, newRating, ratingChange } = result;
    // 승리 여부 판단 (레이팅 변화가 0 이상이면 승리)
    const isWin = ratingChange >= 0;

    // 모달 UI 렌더링
    return (
        <div className="modal-overlay"> {/* 모달 배경 오버레이 */}
            <div className="modal-content"> {/* 모달 내용 컨테이너 */}
                <h2>게임 종료!</h2> {/* 모달 제목 */}
                <div className="rating-info"> {/* 레이팅 정보 영역 */}
                    <p>이전 레이팅: {oldRating}</p> {/* 이전 레이팅 표시 */}
                    <p className={isWin ? 'rating-up' : 'rating-down'}> {/* 레이팅 변화 표시, 승리/패배에 따라 색상 변경 */}
                        레이팅 변화: {isWin ? '+' : ''}{ratingChange}
                    </p>
                    <h3>최종 레이팅: {newRating}</h3> {/* 최종 레이팅 표시 */}
                </div>
                <p className="countdown-message"> {/* 로비 이동 카운트다운 메시지 */}
                    {countdown}초 후에 로비로 이동합니다...
                </p>
            </div>
        </div>
    );
};

// 컴포넌트 내보내기
export default GameResultModal;