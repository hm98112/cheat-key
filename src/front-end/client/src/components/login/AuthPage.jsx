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
    <div
      className="auth-dark-container"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        gap: '32px',
      }}
    >
      <div
        className="auth-center-box"
        style={{
          background: 'rgba(30,30,30,0.95)',
          borderRadius: '16px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
          padding: '40px 32px',
          width: '350px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {isLoginView ? (
          <>
            <h2 style={{ color: '#fff', marginBottom: '24px' }}>로그인</h2>
            <LoginForm />
            <p style={{ marginTop: '24px', color: '#bbb' }}>
              계정이 없으신가요?{' '}
              <button
                onClick={toggleView}
                className="toggle-btn"
                style={{
                  background: 'none',
                  color: '#4ecdc4',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 'bold',
                  fontSize: '1em',
                  padding: 0,
                }}
              >
                회원가입
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 style={{ color: '#fff', marginBottom: '24px' }}>회원가입</h2>
            <SignupForm />
            <p style={{ marginTop: '24px', color: '#bbb' }}>
              이미 계정이 있으신가요?{' '}
              <button
                onClick={toggleView}
                className="toggle-btn"
                style={{
                  background: 'none',
                  color: '#4ecdc4',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 'bold',
                  fontSize: '1em',
                  padding: 0,
                }}
              >
                로그인
              </button>
            </p>
          </>
        )}
      </div>
      <div
        className="auth-center-tetris"
        style={{
          minWidth: '340px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
      </div>
    </div>
  );
}
