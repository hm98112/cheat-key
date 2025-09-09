import React, { useEffect, useRef } from 'react';

const InstructionsModal = ({ onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} onKeyDown={handleKeyDown} tabIndex={-1} ref={modalRef}>
      <div className="content-box modal-content instructions-modal-content">
        <h2 className="form-title">게임설명서</h2>
        
        <h3>조작키</h3>
        <ul className="instructions-list">
          <li><span>←</span> : 왼쪽으로 이동</li>
          <li><span>→</span> : 오른쪽으로 이동</li>
          <li><span>↓</span> : 아래로 내리기 (소프트 드롭)</li>
          <li><span>↑</span> : 블록 회전</li>
          <li><span>spacebar</span> : 한번에 내리기 (하드 드롭)</li>
        </ul>

        <h3>게임 방식</h3>
        <p>가로 한 줄을 블록으로 모두 채우면 해당 줄이 사라지면서 점수를 얻습니다.</p>
        <p>한 번에 여러 줄(2줄 이상)을 없애면 상대방에게 방해 블록(쓰레기 줄)을 보낼 수 있습니다.</p>
        <p>자신의 블록이 맨 위까지 쌓이면 패배하고, 상대방이 먼저 쌓이면 승리합니다.</p>

        <button className="main-button login" onClick={onClose} style={{marginTop: '20px'}}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default InstructionsModal;