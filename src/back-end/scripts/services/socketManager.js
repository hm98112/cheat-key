// services/socketManager.js
const { Server } = require('socket.io');

// io 객체를 저장할 변수
let io;
// 연결된 클라이언트를 저장하는 Map (key: userId, value: socket 객체)
const clients = new Map();

/**
 * Socket.IO 서버를 초기화하고 HTTP 서버에 연결합니다.
 * @param {import('http').Server} server - Express 앱이 사용하는 HTTP 서버 객체
 */
function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // 프론트엔드 주소
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    // 1. 클라이언트 연결 시 URL 쿼리에서 userId를 가져와 인증합니다.
    const userId = socket.handshake.query.userId;
    if (!userId) {
      console.log('[Socket.IO] Connection rejected: No userId provided.');
      return socket.disconnect();
    }
    
    console.log(`[Socket.IO] Client connected: User ${userId} with socket ID ${socket.id}`);
    clients.set(userId.toString(), socket);

    // 2. 연결 종료 시 처리
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: User ${userId}`);
      clients.delete(userId.toString());
    });
  });

  console.log('✅ Socket.IO server initialized.');
}

/**
 * 특정 사용자에게 이벤트를 발생시키는 함수
 * @param {string} userId - 메시지를 받을 사용자의 ID
 * @param {string} eventName - 발생시킬 이벤트의 이름 (예: 'matchSuccess')
 * @param {object} data - 전송할 데이터
 */
function sendMessageToUser(userId, eventName, data) {
  const clientSocket = clients.get(userId.toString());
  if (clientSocket) {
    clientSocket.emit(eventName, data);
    console.log(`[Socket.IO] Emitted event '${eventName}' to User ${userId}:`, data);
    return true;
  } else {
    console.log(`[Socket.IO] Failed to emit event: User ${userId} not found.`);
    return false;
  }
}

module.exports = {
  initializeSocket,
  sendMessageToUser,
};
