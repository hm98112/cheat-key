// --- START: front-end/src/components/RankingModal.jsx (새 파일) ---
import React from 'react';
import './components.css'; // 공통 컴포넌트 CSS 사용

const RankingModal = ({ rankings, onClose, error }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="content-box modal-content ranking-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="form-title">🏆 Top 10 랭킹 🏆</h2>
        {error ? (
          <p className="error-message">{error}</p>
        ) : (
          <ol className="ranking-list">
            {rankings.map((player, index) => (
              <li key={index}>
                <span className={`rank-${index + 1}`}>{index + 1}</span>
                <span className="ranking-username">{player.username}</span>
                <span className="ranking-elo">{player.elo_rating} 점</span>
              </li>
            ))}
          </ol>
        )}
        <button className="main-button login" onClick={onClose} style={{ marginTop: '20px' }}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default RankingModal;
// --- END: front-end/src/components/RankingModal.jsx (새 파일) ---