import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TetrisAnimation from '@/components/TetrisAnimation';
import './pages.css';

// 백엔드 서버 주소
const API_BASE_URL = 'http://localhost:8080';

const LoginPage = () => {
  const [username, setUsername] = useState(''); // 'email' -> 'username'으로 변경
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: username,
        password: password,
      });

      if (response.status === 200 && response.data.accessToken) {
        const { accessToken } = response.data;

        // 토큰과 함께 입력한 사용자 이름도 localStorage에 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('username', username);

        // 로비 페이지로 이동
        navigate('/lobby');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('사용자 이름 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError('로그인 중 오류가 발생했습니다.');
      }
      console.error("로그인 실패:", err);
    }
  };

  return (
    <div className="main-container">
      <TetrisAnimation />
      <div className="content-box">
        <h2 className="form-title">로그인</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text" // 'email' -> 'text'
            placeholder="사용자 이름" // '이메일' -> '사용자 이름'
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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