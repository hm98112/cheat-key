/**
 * @file socketManager.js
 * @brief Socket.IO 서버를 초기화하고 실시간 통신을 관리하는 모듈
 * @details 이 모듈은 Express 서버에 Socket.IO를 연결하고, 사용자 인증, 게임방 입장,
 * 실시간 게임 데이터 교환 등의 모든 웹소켓 관련 로직을 처리합니다.
 */

// --- 모듈 임포트 ---
const { Server } = require('socket.io');  // Socket.IO 서버 클래스
const jwt = require('jsonwebtoken');      // JWT 검증을 위한 라이브러리

// --- 전역 변수 ---
let io; // 초기화된 Socket.IO 서버 인스턴스를 저장할 변수

// 접속 중인 클라이언트를 관리하기 위한 Map 객체.
// { key: userId(string), value: socket 객체 } 형태로 저장하여,
// 특정 유저에게 메시지를 보낼 때 해당 유저의 소켓을 빠르게 찾을 수 있도록 합니다.
const clients = new Map();

/**
 * Socket.IO 서버를 초기화하고, 각종 이벤트 리스너를 설정합니다.
 * 이 함수는 메인 서버 파일(index.js)에서 한 번만 호출되어야 합니다.
 * @param {object} server - Express의 HTTP 서버 객체
 */
function initializeSocket(server) {
  io = new Server(server, {
    // CORS(Cross-Origin Resource Sharing) 설정
    // 다른 도메인(localhost:5173 - 프론트엔드 개발 서버)에서의 연결 요청을 허용합니다.
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  // --- Socket.IO 미들웨어: JWT 인증 ---
  // 클라이언트가 연결을 시도할 때마다 실행되는 인증 계층입니다.
  io.use((socket, next) => {
    const token = socket.handshake.auth.token; // 클라이언트가 보낸 인증 토큰
    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }
    try {
      // 토큰을 비밀 키로 검증합니다. 보안을 위해 비밀 키는 .env 파일에서 관리합니다.
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
      socket.user = decoded; // 검증 성공 시, 디코딩된 사용자 정보를 소켓 객체에 저장합니다.
      next(); // 인증 성공, 다음 단계(connection 이벤트)로 진행합니다.
    } catch (err) {
      // 디버깅: console.error('[Socket Auth] ❌ 유효하지 않은 토큰:', err.message);
      next(new Error('Authentication error: Invalid token.')); // 인증 실패
    }
  });

  // --- 메인 이벤트 핸들러: 'connection' ---
  // 인증된 클라이언트가 성공적으로 연결되었을 때 실행됩니다.
  io.on('connection', (socket) => {
    // 방어 로직: 미들웨어를 통과했더라도 user 정보가 확실히 있는지 확인
    if (!socket.user || !socket.user.userId) {
        // 디버깅: console.error('[Socket.IO] ❌ 연결 거부: 인증 후 유저 정보가 없습니다.');
        socket.disconnect();
        return;
    }
    const userId = socket.user.userId;
    // 디버깅: console.log(`[Socket.IO] ✅ 클라이언트 연결: User ${userId}, Socket ${socket.id}`);
    
    // clients 맵에 현재 연결된 유저의 소켓 정보를 저장합니다.
    clients.set(userId.toString(), socket);

    // --- 게임방 관련 이벤트 리스너 ---
  
    // 'joinGameRoom': 클라이언트로부터 게임방 참여 요청을 받았을 때
    socket.on('joinGameRoom', (data) => {
      const { gameId } = data;
      if (!gameId) return;

      const gameRoomId = gameId.toString();
      socket.join(gameRoomId);        // Socket.IO의 room 기능에 클라이언트를 참여시킴
      socket.gameRoomId = gameRoomId; // 연결 종료 시 참조할 수 있도록 방 ID를 소켓 객체에 저장
      // 디버깅: console.log(`[Socket] 🚪 유저 ${userId}가 게임방 #${gameRoomId}에 참여했습니다.`);

      // 현재 게임방에 접속한 클라이언트 수를 확인합니다.
      const room = io.sockets.adapter.rooms.get(gameRoomId);
      const numClients = room ? room.size : 0;
      // 디버깅: console.log(`[Socket] 📊 게임방 #${gameRoomId} 현재 인원: ${numClients}명`);

      // 방에 2명이 모두 접속하면 게임 시작 로직을 실행합니다.
      if (numClients === 2) {
        // 디버깅: console.log(`[Socket] 🚀 2명 모두 접속! 게임방 #${gameRoomId}의 게임을 시작합니다.`);
        
        // 방에 있는 모든 클라이언트의 정보를 수집합니다.
        const players = Array.from(room)
          .map(socketId => io.sockets.sockets.get(socketId))
          .filter(s => s && s.user)
          .map(s => ({ id: s.user.userId, username: s.user.username }));

        // 두 플레이어 모두에게 동일한 테트리스 조각 순서를 생성하여 전송 (공정성 확보)
        if (players.length === 2) {
          const initialPieceSequence = Array.from({ length: 50 }, () => Math.floor(Math.random() * 7) +1 );
          // 'gameStart' 이벤트를 해당 게임방의 모든 클라이언트에게 전송합니다.
          io.to(gameRoomId).emit('gameStart', {
            room: gameId,
            pieceSequence: initialPieceSequence,
            players: players,
          });
        } else {
          // 디버깅: console.error(`[Socket Error] 🚨 게임방 #${gameRoomId}의 플레이어 정보를 가져오는 데 실패했습니다.`);
        }
      }
    });

    // --- 게임 진행 관련 이벤트 리스너 ---

    // 'boardState' 이벤트: 상대방에게 보드 상태를 전송합니다.
    socket.on('boardState', (data) => {
        if(data && data.room) socket.to(data.room.toString()).emit('opponentState', data);
    });

    // 'lineClear': 라인 클리어 시 상대방에게 공격 (쓰레기 라인) 전송
    socket.on('lineClear', (data) => {
        if(data && data.room) {
            const garbageToSend = data.lines > 1 ? data.lines - 1 : 0;
            if (garbageToSend > 0) {
                socket.to(data.room.toString()).emit('addGarbage', garbageToSend);
            }
        }
    });

    // 'gameOver': 내가 패배했을 때, 상대방에게 승리했음을 알림
    socket.on('gameOver', (data) => {
        if(data && data.room) socket.to(data.room.toString()).emit('opponentWin');
    });

    // 'requestMorePieces': 클라이언트가 블록을 다 썼을 때 추가 블록을 요청
    socket.on('requestMorePieces', () => {
      const newPieces = Array.from({ length: 50 }, () => Math.floor(Math.random() * 7)+1);
      // 'socket.emit'은 요청을 보낸 '자기 자신에게만' 메시지를 보냅니다.
      socket.emit('addMorePieces', { newPieces });
    });

    // --- 연결 종료 이벤트 리스너 ---
    socket.on('disconnect', () => {
      // 디버깅: console.log(`[Socket.IO] 🔌 클라이언트 연결 끊김: User ${userId}, Socket ${socket.id}`);
      clients.delete(userId.toString()); // clients 맵에서 해당 유저 정보 제거

      // 만약 유저가 게임방에 참여한 상태였다면, 방에 남아있는 상대방에게 연결이 끊겼음을 알립니다.
      if (socket.gameRoomId) {
        // 디버깅: console.log(`[Socket] 📢 게임방 #${socket.gameRoomId}에 상대방의 연결 끊김을 알립니다.`);
        socket.to(socket.gameRoomId).emit('opponentDisconnect');
      }
    });
  });

  // 디버깅: console.log('✅ Socket.IO server initialized.');
}

/**
 * 특정 유저 ID를 가진 클라이언트에게 개인 메시지를 전송하는 헬퍼 함수입니다.
 * (주로 매치메이킹 성공 알림 등 서버 로직에서 클라이언트로 정보를 보낼 때 사용됩니다.)
 * @param {string | number} userId - 메시지를 받을 유저의 ID
 * @param {string} eventName - 전송할 이벤트의 이름
 * @param {object} data - 전송할 데이터
 * @returns {boolean} 전송 성공 여부
 */
function sendMessageToUser(userId, eventName, data) {
  const clientSocket = clients.get(userId.toString());
  if (clientSocket) {
    clientSocket.emit(eventName, data);
    // 디버깅: console.log(`[Socket.IO] 📤 메시지 전송 -> User ${userId}, Event: ${eventName}`);
    return true;
  } else {
    // 디버깅: console.log(`[Socket.IO] ❓ 전송 실패: User ${userId}를 찾을 수 없음.`);
    return false;
  }
}

// 외부에서 사용할 수 있도록 두 함수를 내보냅니다.
module.exports = {
  initializeSocket,
  sendMessageToUser,
};

