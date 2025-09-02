import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('로그인 시도:', { email, password });
    // 여기에 실제 API 호출 로직을 추가합니다.
    // 예: api.login(email, password)
    //     .then(response => { /* 로그인 성공 처리 */ })
    //     .catch(error => { /* 에러 처리 */ });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <Link to="/">
                <button>메인화면</button>
      </Link>
      <div className="input-group">
        <label htmlFor="login-email">이메일</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label htmlFor="login-password">비밀번호</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="submit-btn">
        로그인
      </button>
    </form>
  );
};

export default LoginPage;