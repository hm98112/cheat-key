import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import LogoutModal from './LogoutModal';
import './components.css';

const Header = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutModal(false); // 모달 먼저 닫기
    auth.logout();           // 로그아웃 로직 실행
    navigate('/signin');     // 로그인 페이지로 이동
  };

  return (
    <header className="app-header">
      <Link to="/" className="logo">
        CHEATKEY GAME
      </Link>
      
      <nav className="navigation">
        {auth.isLoggedIn ? (
          <div className="user-actions">
            <span>{auth.user?.username}님 환영합니다!</span>
            <button
              className="main-button secondary"
              onClick={() => setShowLogoutModal(true)}
            >
              로그아웃
            </button>
          </div>
        ) : (
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