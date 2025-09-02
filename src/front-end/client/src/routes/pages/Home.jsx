import React, { useState, useEffect } from 'react';


const TetrisLoginScreen = () => {
  const [blocks, setBlocks] = useState([]);

  // 테트리스 블록 모양들
  const tetrisShapes = [
    // I-블록
    [[1,1,1,1]],
    // O-블록
    [[1,1],[1,1]],
    // T-블록
    [[0,1,0],[1,1,1]],
    // S-블록
    [[0,1,1],[1,1,0]],
    // Z-블록
    [[1,1,0],[0,1,1]],
    // J-블록
    [[1,0,0],[1,1,1]],
    // L-블록
    [[0,0,1],[1,1,1]]
  ];

  const colors = [
    'bg-cyan-400', 'bg-yellow-400', 'bg-purple-400', 
    'bg-green-400', 'bg-red-400', 'bg-blue-400', 'bg-orange-400'
  ];

  // 블록 생성 함수
  const createBlock = () => {
    const shapeIndex = Math.floor(Math.random() * tetrisShapes.length);
    const shape = tetrisShapes[shapeIndex];
    const color = colors[shapeIndex];
    
    return {
      id: Date.now() + Math.random(),
      shape,
      color,
      x: Math.random() * (window.innerWidth - 120),
      y: -100,
      rotation: Math.random() * 360,
      speed: 1 + Math.random() * 2
    };
  };

  // 블록 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setBlocks(prev => {
        const newBlocks = prev
          .map(block => ({
            ...block,
            y: block.y + block.speed,
            rotation: block.rotation + 1
          }))
          .filter(block => block.y < window.innerHeight);

        // 새 블록 추가 (확률적으로)
        if (Math.random() < 0.3 && newBlocks.length < 15) {
          newBlocks.push(createBlock());
        }

        return newBlocks;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // 테트리스 블록 렌더링
  const renderTetrisBlock = (block) => (
    <div
      key={block.id}
      className="absolute opacity-20"
      style={{
        left: block.x,
        top: block.y,
        transform: `rotate(${block.rotation}deg)`
      }}
    >
      {block.shape.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className={`w-6 h-6 ${cell ? block.color : ''} ${cell ? 'border border-white/30' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 배경 테트리스 블록들 */}
      <div className="absolute inset-0">
        {blocks.map(renderTetrisBlock)}
      </div>

      {/* 그리드 패턴 배경 */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        
        {/* 게임 로고 */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            <span className="text-cyan-400">T</span>
            <span className="text-yellow-400">E</span>
            <span className="text-purple-400">T</span>
            <span className="text-green-400">R</span>
            <span className="text-red-400">I</span>
            <span className="text-blue-400">S</span>
          </h1>
          <h2 className="text-2xl font-semibold text-white/80 tracking-wide">
            BATTLE ARENA
          </h2>
          <div className="mt-4 h-1 w-32 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto rounded-full"></div>
        </div>

        {/* 로그인/회원가입 박스 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
          <div className="space-y-6">
            
            {/* 로그인 버튼 */}
            <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="text-lg">로그인</span>
            </button>

            {/* 구분선 */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-white/60 font-medium">또는</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* 회원가입 버튼 */}
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="text-lg">회원가입</span>
            </button>


          </div>
        </div>

        {/* 하단 정보 */}
        <div className="mt-12 text-center text-white/50">
          <p className="mb-2">친구들과 함께하는 실시간 테트리스 대전!</p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <span>🎮 실시간 대전</span>
            <span>⚡ 빠른 매칭</span>
            <span>🏆 랭킹 시스템</span>
          </div>
        </div>
      </div>

      {/* 글로우 효과 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default TetrisLoginScreen;