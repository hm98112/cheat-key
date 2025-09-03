import { React, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TetrisAnimation from '@/components/TetrisAnimation';
import './pages.css';

const SignupPage = () => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    console.log('회원가입 시도:', { nickname, email, password });
  };

  return (
    <div className="main-container">
      <TetrisAnimation />
      <div className="content-box">
        <h2 className="form-title">회원가입</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="닉네임"
            className="auth-input"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
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
            minLength={8}
          />
          {error && <p className="error-message">{error}</p>}

          {/* 버튼 그룹 */}
          <div className="form-button-group">
            <button type="submit" className="main-button signup">
              가입하기
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
          이미 계정이 있으신가요?{' '}
          <a href="#" onClick={() => navigate('/signin')}>
            로그인
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;