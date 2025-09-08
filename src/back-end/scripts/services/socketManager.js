const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const clients = new Map(); // userId -> socket 매핑

<<<<<<< HEAD
function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
=======
/**
 * 소켓 서버를 초기화하고, 각종 이벤트를 설정합니다.
 * @param {object} server - Express 서버 객체
 */
function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // 클라이언트 주소
>>>>>>> origin/back-end
      methods: ["GET", "POST"]
    }
  });

<<<<<<< HEAD
  // [수정] 모든 소켓 연결에 대해 JWT 토큰 기반 인증을 먼저 수행합니다.
=======
  // JWT 토큰을 사용한 인증 미들웨어
>>>>>>> origin/back-end
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }
    try {
<<<<<<< HEAD
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
=======
      // process.env.JWT_SECRET 환경 변수를 사용하는 것이 보안상 안전합니다.
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
>>>>>>> origin/back-end
      socket.user = decoded; // 소켓 객체에 인증된 유저 정보 저장
      next();
    } catch (err) {
      console.error('[Socket Auth] ❌ 유효하지 않은 토큰:', err.message);
      next(new Error('Authentication error: Invalid token.'));
    }
  });

<<<<<<< HEAD
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
=======
  // 클라이언트 연결 성공 시 실행될 로직
  io.on('connection', (socket) => {
    // 인증 미들웨어를 통과했더라도 유저 정보가 확실히 있는지 한번 더 확인합니다.
    if (!socket.user || !socket.user.userId) {
        console.error('[Socket.IO] ❌ 연결 거부: 인증 후 유저 정보가 없습니다.');
        socket.disconnect();
        return;
    }
    const userId = socket.user.userId;
    console.log(`[Socket.IO] ✅ 클라이언트 연결: User ${userId}, Socket ${socket.id}`);
    clients.set(userId.toString(), socket);

    // 'joinGameRoom' 이벤트 처리: 클라이언트를 특정 게임방에 참여시킵니다.
    socket.on('joinGameRoom', (data) => {
      const { gameId } = data;
      if (!gameId) return;

      const gameRoomId = gameId.toString();
      socket.join(gameRoomId);

      // 연결 종료 시 참조할 수 있도록 소켓 객체에 gameRoomId를 저장합니다.
      socket.gameRoomId = gameRoomId;

      console.log(`[Socket] 🚪 유저 ${userId}가 게임방 #${gameRoomId}에 참여했습니다.`);

      const room = io.sockets.adapter.rooms.get(gameRoomId);
      const numClients = room ? room.size : 0;
      console.log(`[Socket] 📊 게임방 #${gameRoomId} 현재 인원: ${numClients}명`);

      // 방에 2명이 모두 접속하면 게임 시작 로직을 실행합니다.
      if (numClients === 2) {
        console.log(`[Socket] 🚀 2명 모두 접속! 게임방 #${gameRoomId}의 게임을 시작합니다.`);

        const players = [];
        // 현재 방에 있는 모든 소켓 ID를 순회합니다.
        for (const socketId of room.keys()) {
          const clientSocket = io.sockets.sockets.get(socketId);
          if (clientSocket && clientSocket.user) {
            players.push({
              id: clientSocket.user.userId,
              username: clientSocket.user.username, // JWT 페이로드에 username이 있다고 가정
            });
          }
        }

        // 플레이어 정보가 2명 모두 정상적으로 확보되었는지 확인합니다.
        if (players.length === 2) {
          const initialPieceSequence = Array.from({ length: 50 }, () => Math.floor(Math.random() * 7) + 1);

          io.to(gameRoomId).emit('gameStart', {
            room: gameId,
            pieceSequence: initialPieceSequence,
            players: players,
          });
        } else {
          console.error(`[Socket Error] 🚨 게임방 #${gameRoomId}의 플레이어 정보를 가져오는 데 실패했습니다.`);
        }
      }
    });

    // --- 게임 진행 관련 이벤트 리스너 ---

    // 'boardState' 이벤트: 상대방에게 보드 상태를 전송합니다.
    socket.on('boardState', (data) => {
        if(data && data.room) {
            socket.to(data.room.toString()).emit('opponentState', data);
        }
    });

    // 'lineClear' 이벤트: 라인 클리어 시 상대방에게 쓰레기 라인을 보냅니다.
    socket.on('lineClear', (data) => {
        if(data && data.room) {
            const garbageToSend = data.lines > 1 ? data.lines - 1 : 0;
            if (garbageToSend > 0) {
                socket.to(data.room.toString()).emit('addGarbage', garbageToSend);
            }
        }
    });

    // 'gameOver' 이벤트: 상대방에게 게임 승리 이벤트를 보냅니다.
    socket.on('gameOver', (data) => {
        if(data && data.room) {
            socket.to(data.room.toString()).emit('opponentWin');
        }
    });

    // 'requestMorePieces' 이벤트: 새로운 테트리스 조각을 요청받으면 생성해서 보냅니다.
    socket.on('requestMorePieces', () => {
      const newPieces = Array.from({ length: 50 }, () => Math.floor(Math.random() * 7) + 1);
      socket.emit('addMorePieces', { newPieces });
    });

    // 클라이언트 연결 종료 시 실행될 로직
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] 🔌 클라이언트 연결 끊김: User ${userId}, Socket ${socket.id}`);
      clients.delete(userId.toString());

      // [수정] 게임방에 참여한 상태였다면, 상대방에게 연결 종료를 알립니다.
      if (socket.gameRoomId) {
        console.log(`[Socket] 📢 게임방 #${socket.gameRoomId}에 상대방의 연결 끊김을 알립니다.`);
        socket.to(socket.gameRoomId).emit('opponentDisconnect');
>>>>>>> origin/back-end
      }
    });
  });

  console.log('✅ Socket.IO server initialized.');
}

<<<<<<< HEAD
// [유지] matchmakingService가 이 함수를 사용하여 로비에 있는 유저에게 메시지를 보냅니다.
=======
/**
 * 특정 유저에게 개인적인 메시지를 보냅니다. (매치메이킹 등에서 사용)
 * @param {string} userId - 메시지를 받을 유저의 ID
 * @param {string} eventName - 이벤트 이름
 * @param {object} data - 전송할 데이터
 */
>>>>>>> origin/back-end
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
<<<<<<< HEAD
};
=======
};

>>>>>>> origin/back-end
