import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import '@/index.css';

export default function AuthPage () {
  const [isLoginView, setIsLoginView] = useState(true);

  const toggleView = () => {
    setIsLoginView(!isLoginView);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        {isLoginView? (
          <>
            <h2>로그인</h2>
            <LoginForm />
            <p>
              계정이 없으신가요?{' '}
              <button onClick={toggleView} className="toggle-btn">
                회원가입
              </button>
            </p>
          </>
        ) : (
          <>
            <h2>회원가입</h2>
            <SignupForm />
            <p>
              이미 계정이 있으신가요?{' '}
              <button onClick={toggleView} className="toggle-btn">
                로그인
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
