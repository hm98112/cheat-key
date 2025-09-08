// Node.js 내장 모듈
const http = require('http');
const express = require('express');
const cors = require('cors');

// 필요한 라이브러리들을 가져옵니다.
const usersRouter = require('./scripts/api/users'); 
const authRouter = require('./scripts/api/auth'); 
const matchmakingRouter = require('./scripts/api/matchmaking');
const { initializeSocket } = require('./scripts/services/socketManager');
const { startMatchmaking } = require('./scripts/services/matchmaking');
const gameResultRouter = require('./scripts/api/gameresult'); 
const gamesRouter = require('./scripts/api/games');

// Express 애플리케이션 생성
const app = express();
const server = http.createServer(app);

// 미들웨어 설정
app.use(cors({  
  origin: ["http://localhost", "http://localhost:80"],
  credentials: true, 
}));
app.use(express.json());

// Health check 엔드포인트
app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 필수 환경 변수 확인
console.log('--- 환경 변수 설정 상태 확인 ---');
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL', 'REDIS_HOST', 'REDIS_PASS'];
let missingVars = [];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: 설정됨`);
  } else {
    console.log(`❌ ${varName}: 설정되지 않음`);
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.error(`❌ 중요 오류: 다음 환경 변수들이 설정되지 않았습니다: ${missingVars.join(', ')}`);
  console.error('Key Vault 설정을 확인해주세요.');
  process.exit(1);
}

// API 라우터 등록
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/matchmaking', matchmakingRouter);
app.use('/api/games', gamesRouter);
app.use('/api/game', gameResultRouter); 

// Socket.IO 서버 초기화
initializeSocket(server);

// 서버 실행
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 포트에서 실행 중입니다.`);
  startMatchmaking();
  console.log('✅ 매치메이킹 서비스가 시작되었습니다.');
});

// 서버 종료 시 정리 작업
process.on('SIGTERM', () => {
  console.log('🔄 서버 종료 신호를 받았습니다. 정리 작업을 시작합니다...');
  server.close(() => {
    console.log('✅ 서버가 정상적으로 종료되었습니다.');
    process.exit(0);
  });
});