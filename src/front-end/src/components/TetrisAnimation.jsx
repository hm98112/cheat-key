import React, { useState, useEffect, useRef } from 'react';

const SHAPES = ['l-shape', 'square-shape', 'n-shape', 'i-shape', 't-shape'];
const MAX_SHAPES = 10; // 동시에 화면에 존재할 최대 도형 개수

// 테트리스 배경 애니메이션 컴포넌트
const TetrisAnimation = () => {
  // 현재 화면에 표시 중인 도형 리스트
  const [shapeList, setShapeList] = useState([]);
  // setInterval 관리용 ref
  const intervalRef = useRef(null);
  // 도형 고유 key 생성을 위한 카운터 ref
  const countRef = useRef(0);

  // 컴포넌트 마운트 시 도형을 주기적으로 추가하는 interval 시작
  useEffect(() => {
    function addShape() {
      setShapeList(prev => {
        // 최대 도형 개수에 도달하면 interval 중단
        if (prev.length >= MAX_SHAPES) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return prev;
        }
        // 랜덤 도형, 랜덤 위치 생성
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
    intervalRef.current = setInterval(addShape, 1200); // 1.2초마다 도형 추가
    return () => {
      // 언마운트 시 interval 정리
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // 도형 애니메이션이 끝나면 해당 도형을 리스트에서 제거
  const handleAnimationEnd = key => {
    setShapeList(prev => prev.filter(shape => shape.key !== key));
  };

  // 도형 리스트를 화면에 렌더링
  return (
    <div className="tetris-shapes">
      {shapeList.map(({ type, left, delay, key }) => (
        <div
          key={key} // 고유 key
          className={`shape ${type}`} // 도형 종류별 클래스
          style={{ left, animationDelay: delay }} // 랜덤 위치, 애니메이션 딜레이
          onAnimationEnd={() => handleAnimationEnd(key)} // 애니메이션 끝나면 제거
        />
      ))}
    </div>
  );
};

export default TetrisAnimation;