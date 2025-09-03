import { React, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './pages.css';
import TetrisAnimation from '@/components/TetrisAnimation';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
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
            type="email"
            placeholder="이메일"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {error && <p className="error-message">{error}</p>}
          
          {/* 버튼 그룹 */}
          <div className="form-button-group">
            <button type="submit" className="main-button login">
              로그인
            </button>
            <button
              type="button"
              className="main-button secondary"
              onClick={() => navigate('/')}
            >
              메인 화면
            </button>
          </div>

        </form>
        <p className="switch-link">
          계정이 없으신가요?{' '}
          <a href="#" onClick={() => navigate('/signup')}>
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;