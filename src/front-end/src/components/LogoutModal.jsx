import React, { useEffect, useRef } from 'react';

// 로그아웃 모달 컴포넌트. onConfirm: 확인 클릭 시 실행, onCancel: 취소 클릭 시 실행
const LogoutModal = ({ onConfirm, onCancel }) => {
  // 모달 DOM 참조를 위한 ref
  const modalRef = useRef(null);

  // 모달이 마운트될 때 "확인" 버튼에 포커스
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  // Enter 키: 확인, Escape 키: 취소
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

  // 모달 렌더링
  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick} // 배경 클릭 시 취소
      onKeyDown={handleKeyDown}     // 키 입력 처리
      tabIndex={-1}                // 포커스 가능하게
      ref={modalRef}               // ref 연결
    >
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