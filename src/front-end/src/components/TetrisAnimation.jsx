import React, { useState, useEffect, useRef } from 'react';

const SHAPES = ['l-shape', 'square-shape', 'n-shape', 'i-shape', 't-shape'];
const MAX_SHAPES = 10;

const TetrisAnimation = () => { // 이름 변경
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
    intervalRef.current = setInterval(addShape, 1200);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

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

export default TetrisAnimation;