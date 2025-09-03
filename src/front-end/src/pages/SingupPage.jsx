import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TetrisAnimation from '@/components/TetrisAnimation';
import './pages.css';

// 백엔드 서버 주소
const API_BASE_URL = 'http://localhost:8080';

const SignupPage = () => {
  const [username, setUsername] = useState(''); // 'nickname', 'email' -> 'username'으로 변경
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/signup`, {
        username: username,
        password: password,
      });

      if (response.status === 201) {
        console.log('회원가입 성공:', response.data.message);
        // 회원가입 성공 시 로그인 페이지로 이동
        navigate('/signin');
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        // 409 Conflict: 사용자 이름 중복 에러
        setError('이미 사용 중인 사용자 이름입니다.');
      } else {
        // 그 외 서버 에러
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
      console.error('회원가입 실패:', err);
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
            placeholder="사용자 이름" // '닉네임' -> '사용자 이름'
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
            minLength={8}
          />
          {error && <p className="error-message">{error}</p>}

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