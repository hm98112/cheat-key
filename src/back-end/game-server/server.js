// back-end/game-server/server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // 모든 출처의 연결을 허용 (테스트용)
    methods: ["GET", "POST"]
  }
});


// public 폴더를 정적 파일 제공 경로로 설정합니다.
app.use(express.static(path.join(__dirname, 'public')));

const SHAPES_COUNT = 7; // 도형 개수 정의(0번 인덱스 제외)
let waitingPlayer = null;

function generateInitialPieceSequence(length = 50) {
  return Array.from({ length }, () => Math.floor(Math.random() * SHAPES_COUNT) + 1);
}

// Socket.IO 연결 처리
io.on('connection', (socket) => {
  console.log('새로운 클라이언트 접속:', socket.id);

  if (waitingPlayer) {
    // 이미 대기 중인 플레이어가 있으면, 게임 룸을 생성하고 두 플레이어에게 게임 시작을 알림
    const room = `room_${socket.id}_#_${waitingPlayer.id}`;
    socket.join(room);
    waitingPlayer.join(room);

    // 서버에서 공통된 도형 순서를 생성.
    const pieceSequence = generateInitialPieceSequence();
    // gameStart 이벤트 전달시, 생성된 도형 순서 포함하여 전달
    io.to(room).emit('gameStart', {
      room,
      pieceSequence: pieceSequence
    });
    
    console.log(`게임 시작: ${room}`);
    
    waitingPlayer = null; // 대기열 초기화
  } else {
    // 대기 중인 플레이어가 없으면, 현재 플레이어를 대기열에 추가
    waitingPlayer = socket;
    waitingPlayer.emit('waiting');
  }

  // 게임 관련 이벤트 처리
  socket.on('boardState', (data) => {
    socket.to(data.room).emit('opponentState', data);
  });

  socket.on('lineClear', (data) => {
    socket.to(data.room).emit('addGarbage', data.lines);
  });

  socket.on('gameOver', (data) => {
    socket.to(data.room).emit('opponentWin');
  });

  socket.on('disconnect', () => {
    console.log('클라이언트 접속 해제:', socket.id);
    if (waitingPlayer === socket) {
      waitingPlayer = null; // 대기 중인 플레이어가 나가면 대기열 초기화
    }
  });
});

const PORT = 3001; // API 서버(8080)와 다른 포트 사용
server.listen(PORT, () => console.log(`게임 서버가 http://localhost:${PORT} 에서 실행 중입니다.`));