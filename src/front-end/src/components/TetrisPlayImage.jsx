import React from 'react';
import './components.css'; // 스타일을 위한 CSS 파일

// FIX: 실제 index.html 게임에서 사용하는 색상 배열 (null을 포함하여 1번부터 인덱싱)
const GAME_COLORS = [null, '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF'];

// FIX: 원래 제공해주신 보드 내 블록 모양(boardState)은 절대 변경하지 않았습니다.
const boardState = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 5, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 5, 0, 0, 0, 0, 0],
  [0, 0, 0, 5, 5, 0, 0, 0, 0, 0],
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

// FIX: 다음 블록(T)을 4x4 그리드 중앙에 배치 (7번: 보라색)
const nextBlockState = [
  [0, 0, 0, 0, ],
  [0, 2, 2, 0, ],
  [0, 2, 2, 0, ],
  [0, 0, 0, 0, ],
];

// FIX: 홀드 박스는 비어있도록 0으로만 채움
const holdBlockState = [
  [0, 0, 0, 0, ],
  [0, 0, 0, 0, ],
  [0, 0, 0, 0, ],
  [0, 0, 0, 0, ],
];


// 숫자에 해당하는 색상을 반환하는 헬퍼 함수
const getColor = (value) => {
  // boardState의 숫자(1~5)가 GAME_COLORS의 인덱스(1~7)에 맞게 매칭됩니다.
  return value > 0 && value < GAME_COLORS.length ? GAME_COLORS[value] : 'transparent';
};

// 보드나 미리보기 캔버스를 렌더링하는 공통 함수
const renderGrid = (data, className) => (
  <div className={className}>
    {data.flat().map((cell, index) => (
      <div
        key={index}
        className={`${className}-cell`} // e.g., tetris-board-cell
        style={{ backgroundColor: getColor(cell) }}
      />
    ))}
  </div>
);


const TetrisPlayImage = () => {
  return (
    <div className="tetris-image-container">
      <div className="tetris-image-inner-content">

        {/* FIX: 왼쪽 홀드 박스 (비어 있음) */}
        <div className="tetris-side-area">
            <h3>홀드 (C)</h3>
            {renderGrid(holdBlockState, "tetris-preview-canvas")}
        </div>
        
        {/* FIX: 중앙 게임 보드 */}
        <div className="tetris-player-area">
            {renderGrid(boardState, "tetris-board")}
            <div className="tetris-info">
              SCORE: <span>001130</span>
            </div>
        </div>

        {/* FIX: 오른쪽 다음 블록 박스 (T 블록) */}
        <div className="tetris-side-area">
            <h3>다음 블록</h3>
            {renderGrid(nextBlockState, "tetris-preview-canvas")}
        </div>

      </div>
    </div>
  );
};

export default TetrisPlayImage;