import { React, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './pages.css';
import TetrisAnimation from '@/components/TetrisAnimation';
import { login } from '../api/auth'; // Canvas의 auth.js 파일에서 login 함수를 가져옵니다.

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(''); // 닉네임 또는 이메일
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      // 1. auth.js의 login 함수를 호출하여 API 요청을 보냅니다.
      const responseData = await login(identifier, password);
      setMessage('로그인 성공! 메인 화면으로 이동합니다.');

      // 2. 서버로부터 받은 accessToken을 localStorage에 저장합니다.
      // (실제 프로덕션에서는 보안을 위해 HttpOnly 쿠키나 상태 관리 라이브러리를 사용하는 것이 더 좋습니다.)
      localStorage.setItem('accessToken', responseData.accessToken);

      // 3. 성공 시 1.5초 후 메인 페이지로 이동합니다.
      setTimeout(() => navigate('/'), 1500);

    } catch (error) {
      const errorMessage = error.response?.data?.message || '로그인 실패. 아이디 또는 비밀번호를 확인해 주세요.';
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container">
      <TetrisAnimation />
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
          


          {/* 버튼 그룹 */}
          <div className="form-button-group">
            <button type="submit" className="main-button login" disabled={isLoading}>
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
          계정이 없으신가요?{' '}
          <a href="/signup" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;