import React from 'react';
import './TetrisPlayImage.css'; // 스타일을 위한 CSS 파일

// 각 블록의 색상 정의
const COLORS = {
  i: 'rgba(241, 13, 13, 0.871)', // I 도형 (빨강)
  l: 'rgba(6, 193, 245, 0.967)',  // L 도형 (하늘색)
  o: 'rgba(228, 142, 14, 0.992)', // 네모 도형 (주황)
  t: 'rgb(142, 4, 147)',           // T 도형 (보라)
  n: 'rgba(27, 242, 7, 0.964)',   // N 도형 (녹색)
};

// 게임 보드의 상태를 나타내는 2D 배열
// 0: 빈 칸, 1~5: 각 도형의 일부
const boardState = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 2], 
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 2], 
  [0, 0, 0, 0, 5, 0, 4, 0, 2, 2], 
  [1, 4, 2, 2, 5, 5, 4, 4, 3, 3], 
  [1, 4, 4, 2, 1, 5, 4, 5, 3, 3], 
  [1, 4, 5, 2, 1, 2, 5, 5, 2, 2], 
  [1, 4, 5, 5, 1, 2, 5, 3, 3, 2], 
  [4, 4, 4, 5, 1, 2, 2, 3, 3, 2], 
];

// 숫자에 해당하는 색상을 반환하는 헬퍼 함수
const getColor = (value) => {
  switch (value) {
    case 1: return COLORS.i;
    case 2: return COLORS.l;
    case 3: return COLORS.o;
    case 4: return COLORS.t;
    case 5: return COLORS.n;
    default: return 'transparent';
  }
};

const TetrisPlayImage = () => {
  return (
    <div className="tetris-image-container">
      {/* 게임 보드 */}
      <div className="tetris-board">
        {boardState.flat().map((cell, index) => (
          <div
            key={index}
            className="tetris-cell"
            style={{ backgroundColor: getColor(cell) }}
          />
        ))}
      </div>

      {/* 우측 정보 패널 */}
      <div className="info-panel">
        <div className="info-box next-box">
          <p>NEXT</p>
          <div className="next-shape">
            {/* T 도형 예시 */}
            <div className="cell" style={{ backgroundColor: COLORS.t, gridColumn: 2, gridRow: 1 }}/>
            <div className="cell" style={{ backgroundColor: COLORS.t, gridColumn: 1, gridRow: 2 }}/>
            <div className="cell" style={{ backgroundColor: COLORS.t, gridColumn: 2, gridRow: 2 }}/>
            <div className="cell" style={{ backgroundColor: COLORS.t, gridColumn: 3, gridRow: 2 }}/>
          </div>
        </div>
        <div className="info-box">
          <p>SCORE</p>
          <span>001130</span>
        </div>
        <div className="info-box">
          <p>LEVEL</p>
          <span>05</span>
        </div>
      </div>
    </div>
  );
};

export default TetrisPlayImage;