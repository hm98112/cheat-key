import React, { useState } from 'react'; // Unused imports removed
import React, { useState } from 'react'; // Unused imports removed
import { useNavigate } from 'react-router-dom';
import './pages.css';
import TetrisAnimation from '@/components/TetrisAnimation';
import { login } from '../api/auth';
import { login } from '../api/auth';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false); // For styling the message
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('로그인 시도:', { email, password });
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
          
          {/* 👇 'error'를 'message'로 수정하고, isError 상태에 따라 클래스를 동적으로 변경합니다. */}
          {message && (
            <p className={isError ? 'error-message' : 'success-message'}>
              {message}
            </p>
          )}

          <div className="form-button-group">
            <button type="submit" className="main-button login" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
            <button
              type="button"
              className="main-button secondary"
              onClick={() => navigate('/')}
              disabled={isLoading}>
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

