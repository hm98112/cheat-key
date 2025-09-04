import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 중앙 관제실(AuthContext)과 통신하기 위한 훅
// import TetrisAnimation from '@/components/TetrisAnimation'; // 배경 애니메이션
// import './pages.css'; // 페이지 공통 스타일

const SigninPage = () => {
  // 1. 컴포넌트 내부 상태 관리
  const [identifier, setIdentifier] = useState(''); // 닉네임 또는 이메일 입력값
  const [password, setPassword] = useState('');     // 비밀번호 입력값
  const [message, setMessage] = useState('');       // 성공 또는 에러 메시지
  const [isLoading, setIsLoading] = useState(false);  // 로딩 상태 (API 요청 중)

  // 2. 페이지 이동을 위한 함수와 인증 컨텍스트 가져오기
  const navigate = useNavigate();
  const auth = useAuth(); // AuthContext에서 login, isLoggedIn 등의 값을 가져옵니다.

  /**
   * 폼 제출 시 실행될 핸들러 함수
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 기본 동작(새로고침) 방지
    setMessage('');
    setIsLoading(true);

    try {
      // 3. 중앙 관제실(AuthContext)의 login 함수를 호출합니다.
      //    복잡한 API 호출, 토큰 저장 등은 모두 Context가 알아서 처리합니다.
      await auth.login(identifier, password);
      
      setMessage('로그인 성공! 잠시 후 로비로 이동합니다.');

      // 4. 성공 시 1.5초 뒤 로비 페이지로 이동합니다.
      setTimeout(() => navigate('/lobby'), 1500);

    } catch (error) {
      const errorMessage = error.response?.data?.message || '로그인 실패. 아이디 또는 비밀번호를 확인해 주세요.';
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container">
      {/* <TetrisAnimation /> */}
      <div className="content-box">
        <h2 className="form-title">로그인</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="닉네임 또는 이메일"
            className="auth-input"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {message && <p className={message.includes('성공') ? 'success-message' : 'error-message'}>{message}</p>}

          <div className="form-button-group">
            <button type="submit" className="main-button" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
            <button
              type="button"
              className="main-button secondary"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              메인 화면
            </button>
          </div>
        </form>
        <p className="switch-link">
          아직 계정이 없으신가요?{' '}
          <a href="/signup" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
};

export default SigninPage;

