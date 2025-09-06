// services/websocketManager.js

const { WebSocketServer } = require('ws');

// 연결된 모든 클라이언트(사용자)를 저장하는 Map
// key: userId, value: WebSocket 객체
const clients = new Map();

/**
 * WebSocket 서버를 초기화하고 HTTP 서버에 연결합니다.
 * @param {import('http').Server} server - Express 앱이 사용하는 HTTP 서버 객체
 */
function initializeWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    // TODO: WebSocket 연결 시 사용자를 인증하는 로직이 필요합니다.
    // URL 쿼리 파라미터나 쿠키를 통해 accessToken을 받아 검증하고 userId를 추출해야 합니다.
    // 예: const userId = authenticateUser(req);
    const userId = new URLSearchParams(req.url.split('?')[1]).get('userId'); // 임시방편

    if (userId) {
      console.log(`[WebSocket] Client connected: User ${userId}`);
      // 인증된 사용자를 클라이언트 목록에 추가
      clients.set(userId.toString(), ws);

      ws.on('message', (message) => {
        // 클라이언트로부터 메시지를 받았을 때의 처리 로직 (게임 중 채팅 등)
        console.log(`[WebSocket] Received message from User ${userId}: ${message}`);
      });

      ws.on('close', () => {
        console.log(`[WebSocket] Client disconnected: User ${userId}`);
        // 연결이 끊어지면 클라이언트 목록에서 제거
        clients.delete(userId.toString());
      });
    } else {
      console.log('[WebSocket] Connection rejected: Unauthenticated user.');
      ws.close();
    }
  });

  console.log('✅ WebSocket server initialized.');
}

/**
 * 특정 사용자에게 메시지를 전송하는 함수
 * @param {string} userId - 메시지를 받을 사용자의 ID
 * @param {object} data - 전송할 데이터 (JSON 형태로 변환됨)
 */
function sendMessageToUser(userId, data) {
  const client = clients.get(userId.toString());
  if (client && client.readyState === client.OPEN) {
    client.send(JSON.stringify(data));
    console.log(`[WebSocket] Sent message to User ${userId}:`, data);
    return true;
  } else {
    console.log(`[WebSocket] Failed to send message: User ${userId} not found or not connected.`);
    return false;
  }
}

module.exports = {
  initializeWebSocket,
  sendMessageToUser,
};
