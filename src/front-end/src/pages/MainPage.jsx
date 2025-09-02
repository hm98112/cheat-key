import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css'; // 스타일을 위한 CSS 파일

// 배경에 흩날릴 테트리스 블록 모양들 (하나씩 등장)
const SHAPES = ['l-shape', 'square-shape', 'n-shape', 'i-shape'];
const MAX_SHAPES = 30;
const Tetrominoes = () => {
  const [shapeList, setShapeList] = useState([]);
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      setShapeList(prev => {
        if (prev.length >= MAX_SHAPES) {
          clearInterval(interval);
          return prev;
        }
        // 랜덤 도형, 랜덤 위치
        const shapeType = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const left = `${Math.random() * 90}%`;
        const delay = `0s`;
        count++;
        return [
          ...prev,
          { type: shapeType, left, delay, key: `${shapeType}-${count}` }
        ];
      });
    }, 1900); // 생성 속도 느리게 (1.2초)
    return () => clearInterval(interval);
  }, []);

  // 애니메이션이 끝난 도형 제거
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
        <p className="subtitle">실시간 멀티플레이어 테트리스</p>
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