import React, { useEffect, useRef } from 'react';

const LogoutModal = ({ onConfirm, onCancel }) => {
  const modalRef = useRef(null);

  // 컴포넌트가 마운트될 때 "확인" 버튼에 포커스를 줍니다.
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  // 배경 클릭 시 취소되도록 하는 핸들러
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} onKeyDown={handleKeyDown} tabIndex={-1} ref={modalRef}>
      <div className="content-box modal-content">
        <p className="modal-text">로그아웃 하시겠습니까?</p>
        <div className="button-group">
          <button className="main-button secondary" onClick={onCancel}>
            취소
          </button>
          <button className="main-button login" onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;