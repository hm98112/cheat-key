import React from 'react';
import './components.css'; // 공통 컴포넌트 CSS 사용
import Loader from './Loader';

const RankingModal = ({ rankings, onClose, error, isLoading }) => {
  if (isLoading) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="content-box modal-content ranking-modal" onClick={(e) => e.stopPropagation()}>
          <Loader />
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>랭킹을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="content-box modal-content ranking-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="form-title">🏆 Top 10 랭킹 🏆</h2>
        
        {error ? (
          <p className="error-message">{error}</p>
        ) : rankings.length > 0 ? (
          <ol className="ranking-list">
            {rankings.map((player, index) => (
              <li key={index} className="ranking-item">
                {/* 닉네임과 점수만 표시하며, 등수 숫자는 ol 태그가 자동으로 생성합니다. */}
                <span className="ranking-username">{player.username}</span>
                <span className="ranking-elo">{player.elo_rating} 점</span>
              </li>
            ))}
          </ol>
        ) : (
          <p>랭킹 데이터가 없습니다.</p>
        )}

        <button className="main-button login" onClick={onClose} style={{ marginTop: '20px' }}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default RankingModal;

