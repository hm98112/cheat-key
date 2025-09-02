import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css'; // 스타일을 위한 CSS 파일

// 배경에 흩날릴 테트리스 블록 모양들 (하나씩 등장)
const SHAPES = ['l-shape', 'square-shape', 'n-shape', 'i-shape'];
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

const MainPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/signin'); // '/signin' 경로로 이동
  };

  const handleSignupClick = () => {
    navigate('/signup'); // '/signup' 경로로 이동
  };

  return (
    <div className="main-container">
      <Tetrominoes />
      <div className="content-box">
        <h1 className="title">React Tetris Battle</h1>
        <p className="subtitle">실시간 테트리스 대전</p>
        <div className="button-group">
          <button className="main-button login" onClick={handleLoginClick}>
            로그인
          </button>
          <button className="main-button signup" onClick={handleSignupClick}>
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;