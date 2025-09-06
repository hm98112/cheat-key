import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Link 임포트
import LogoutModal from './LogoutModal';
import './components.css'; // Header 전용 CSS 파일

const Header = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // 로그아웃 로직을 실행하기 전에 먼저 팝업창 닫아 로그아웃 창 남아있는 문제 해결
    setShowLogoutModal(false);
    try {
      await auth.logout();
      navigate('/signin');
    } catch (error) {
      console.error("Failed to logout from Header:", error);
    }
  };

  return (
    // 최상위 클래스를 'app-header'로 변경
    <header className="app-header">
      {/* 로고를 Link 컴포넌트로 만들어 클릭 시 메인 페이지로 이동하도록 함 */}
      <Link to="/" className="logo">
        MY GAME
      </Link>
      
      {/* 네비게이션 영역 */}
      <nav className="navigation">
        {auth.isLoggedIn ? (
          // 로그인 상태일 때: 사용자 정보와 로그아웃 버튼 표시
          <div className="user-actions">
            <span>{auth.user?.username}님 환영합니다!</span>
            <button
              className="main-button secondary" // 'secondary' 클래스 적용
              onClick={() => setShowLogoutModal(true)}
            >
              로그아웃
            </button>
          </div>
        ) : (
          // 로그아웃 상태일 때: 로그인/회원가입 버튼 표시
          <div className="guest-actions">
            <button className="main-button" onClick={() => navigate('/signin')}>
              로그인
            </button>
            <button className="main-button secondary" onClick={() => navigate('/signup')}>
              회원가입
            </button>
          </div>
        )}
      </nav>

      {/* 로그아웃 모달 */}
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </header>
  );
};

export default Header;
