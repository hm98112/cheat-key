import { React, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './pages.css';

// 배경에 흩날릴 테트리스 블록 모양들 (하나씩 등장)
const SHAPES = ['l-shape', 'square-shape', 'n-shape', 'i-shape', 't-shape'];
const MAX_SHAPES = 10;
const Tetrominoes = () => {
  const [shapeList, setShapeList] = useState([]);
  const intervalRef = useRef(null);
  const countRef = useRef(0);

  useEffect(() => {
    function addShape() {
      setShapeList(prev => {
        if (prev.length >= MAX_SHAPES) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return prev;
        }
        // 무조건 1개만 추가
        const shapeType = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const left = `${Math.random() * 90}%`;
        const delay = `0s`;
        countRef.current++;
        return [
          ...prev,
          { type: shapeType, left, delay, key: `${shapeType}-${Date.now()}-${countRef.current}` }
        ];
      });
    }
    // interval은 오직 한 번만 생성
    intervalRef.current = setInterval(addShape, 1200);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // 애니메이션이 끝난 도형 제거 및 interval 재시작 방지
  const handleAnimationEnd = key => {
  setShapeList(prev => prev.filter(shape => shape.key !== key));
  };

  return (
    <div className="tetris-shapes">
      {shapeList.map(({ type, left, delay, key }) => (
        <div
          key={key}
          className={`shape ${type}`}
          style={{ left, animationDelay: delay }}
          onAnimationEnd={() => handleAnimationEnd(key)}
        />
      ))}
    </div>
  );
};

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
      <Tetrominoes />
      {/* ... Tetrominoes 컴포넌트 ... */}
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