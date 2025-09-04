import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 중앙 관제실(AuthContext)과 통신
// import './Header.css'; 

const Header = () => {
  // 1. 필요한 훅들을 가져옵니다.
  const navigate = useNavigate();
  const auth = useAuth(); // AuthContext에서 isLoggedIn, logout 함수를 가져옵니다.

  // 2. 로그아웃 버튼 클릭 시 실행될 핸들러
  const handleLogout = async () => {
    try {
      // AuthContext에 정의된 공식 로그아웃 절차를 실행합니다.
      await auth.logout();
      // 로그아웃 성공 후 로그인 페이지로 이동합니다.
      navigate('/signin');
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <header className="app-header">
      {/* 로고를 클릭하면 메인 페이지로 이동합니다. */}
      <Link to="/" className="logo">My Game</Link>
      
      <nav className="navigation">
        {/* 3. isLoggedIn 상태에 따라 다른 UI를 보여줍니다 (조건부 렌더링). */}
        {auth.isLoggedIn ? (
          // 로그인했을 때 보여줄 UI
          <div className="user-actions">
            {/* TODO: 사용자 닉네임 표시 */}
            <span>환영합니다!</span>
            <button onClick={handleLogout} className="main-button secondary">
              로그아웃
            </button>
          </div>
        ) : (
          // 로그인하지 않았을 때 보여줄 UI
          <div className="guest-actions">
            <button onClick={() => navigate('/signin')} className="main-button">
              로그인
            </button>
            <button onClick={() => navigate('/signup')} className="main-button secondary">
              회원가입
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

