const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const clients = new Map(); // userId -> socket 매핑

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  // [수정] 모든 소켓 연결에 대해 JWT 토큰 기반 인증을 먼저 수행합니다.
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // 소켓 객체에 인증된 유저 정보 저장
      next();
    } catch (err) {
      console.error('[Socket Auth] ❌ 유효하지 않은 토큰:', err.message);
      next(new Error('Authentication error: Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.userId;
    const gameId = socket.handshake.query.gameId;

    console.log(`[Socket.IO] ✅ 클라이언트 연결: User ${userId}, Socket ${socket.id}`);
    clients.set(userId.toString(), socket);

    // --- 게임방 참여 로직 (TetrisPage에서 접속 시) ---
    if (gameId) {
      console.log(`[Socket] 🚪 유저 ${userId}가 게임방 #${gameId}에 참여합니다.`);
      socket.join(gameId);

      const room = io.sockets.adapter.rooms.get(gameId);
      const numClients = room ? room.size : 0;
      console.log(`[Socket] 📊 게임방 #${gameId} 현재 인원: ${numClients}명`);

      if (numClients === 2) {
        console.log(`[Socket] 🚀 2명 모두 접속! 게임방 #${gameId}의 게임을 시작합니다.`);
        const initialPieceSequence = Array.from({length: 50}, () => Math.floor(Math.random() * 7) + 1);
        io.to(gameId).emit('gameStart', { 
          room: gameId,
          pieceSequence: initialPieceSequence,
        });
      }
    }

    // --- 게임 진행 이벤트 리스너들 ---
    socket.on('boardState', (data) => socket.to(data.room).emit('opponentState', data));
    socket.on('lineClear', (data) => {
        const garbageToSend = data.lines > 1 ? data.lines - 1 : 0;
        if (garbageToSend > 0) socket.to(data.room).emit('addGarbage', garbageToSend);
    });
    socket.on('gameOver', (data) => socket.to(data.room).emit('opponentWin'));
    socket.on('requestMorePieces', () => {
        const newPieces = Array.from({length: 50}, () => Math.floor(Math.random() * 7) + 1);
        socket.emit('addMorePieces', { newPieces });
    });

    // --- 연결 종료 시 ---
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] 🔌 클라이언트 연결 끊김: User ${userId}`);
      clients.delete(userId.toString());
      if (gameId) {
          socket.to(gameId).emit('opponentDisconnect');
      }
    });
  });

  console.log('✅ Socket.IO server initialized.');
}

// [유지] matchmakingService가 이 함수를 사용하여 로비에 있는 유저에게 메시지를 보냅니다.
function sendMessageToUser(userId, eventName, data) {
  const clientSocket = clients.get(userId.toString());
  if (clientSocket) {
    clientSocket.emit(eventName, data);
    console.log(`[Socket.IO] 📤 메시지 전송 -> User ${userId}, Event: ${eventName}`);
    return true;
  } else {
    console.log(`[Socket.IO] ❓ 전송 실패: User ${userId}를 찾을 수 없음.`);
    return false;
  }
}

module.exports = {
  initializeSocket,
  sendMessageToUser,
};