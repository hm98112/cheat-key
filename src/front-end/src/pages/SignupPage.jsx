import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TetrisAnimation from '@/components/TetrisAnimation'; // TetrisAnimation 컴포넌트가 준비되면 주석 해제
import './pages.css'; // 이 CSS 파일에 필요한 스타일을 정의해야 합니다.
import { signup } from '../api/auth';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // 성공/에러 메시지를 함께 처리할 상태
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      // Canvas에 있는 auth.js의 signup 함수를 호출합니다.
      const response = await signup(username, email, password);
      setMessage('회원가입 성공! 잠시 후 로그인 페이지로 이동합니다.');
      console.log(response);

      // 성공 시 0.4초 후 로그인 페이지로 이동
      setTimeout(() => navigate('/signin'), 400);

    } catch (error) {
      const errorMessage = error.response?.data?.message || '회원가입 실패. 입력 정보를 확인해 주세요.';
      setMessage(errorMessage);
      console.error('회원가입 오류:', error);
    } finally {
      setIsLoading(false);
    }
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            placeholder="비밀번호 (8자 이상)"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          {message && <p className="message">{message}</p>}

          <div className="form-button-group">
            <button type="submit" className="main-button signup" disabled={isLoading}>
              {isLoading ? '가입 중...' : '가입하기'}
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
          이미 계정이 있으신가요?{' '}
          <a href="/signin" onClick={(e) => { e.preventDefault(); navigate('/signin'); }}>
            로그인
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

