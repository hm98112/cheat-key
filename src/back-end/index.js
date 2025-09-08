// index.js

// Node.js 내장 모듈
const http = require('http');
const express = require('express');
const cors = require('cors');

// 필요한 라이브러리들을 가져옵니다.
const { getSecrets } = require('./scripts/config/keyvault');
const { initializeDatabase } = require('./scripts/config/db');
// ✨ 수정된 부분: connectRedis 함수를 가져옵니다.
const { connectRedis } = require('./scripts/config/redis');
const usersRouter = require('./scripts/api/users'); 
const authRouter = require('./scripts/api/auth'); 
const matchmakingRouter = require('./scripts/api/matchmaking');
const { initializeSocket } = require('./scripts/services/socketManager');
const { startMatchmaking } = require('./scripts/services/matchmaking');
const gameResultRouter = require('./scripts/api/gameresult'); 
const gamesRouter = require('./scripts/api/games');

async function startServer() {
  try {
    console.log('Azure Key Vault에서 비밀 정보를 가져옵니다...');
    const secretNames = [
        'db-host', 'db-user', 'db-password', 'db-port', 'db-database',
        'redis-host', 'redis-pass', 
        'jwt-secret', 'refresh-token-secret'
    ];
    const secrets = await getSecrets(secretNames);
    console.log('✅ 비밀 정보 로딩 완료.');

    console.log('--- Key Vault 비밀을 process.env에 설정합니다 ---');
    for (const key in secrets) {
      const envVarName = key.toUpperCase().replace(/-/g, '_');
      process.env[envVarName] = secrets[key];
      console.log(`✅ ${envVarName}: 설정됨`);
    }
    console.log('-------------------------------------------');
    
    // 가져온 비밀 정보로 각 서비스를 초기화합니다.
    await initializeDatabase();
    // ✨ 수정된 부분: 새 연결 함수를 호출합니다.
    await connectRedis();

    // Express 애플리케이션 생성
    const app = express();
    const server = http.createServer(app);

    // 미들웨어 설정
    app.use(cors({   
      origin: ["http://localhost", "http://localhost:80", "http://localhost:5173"],
      credentials: true, 
    }));
    app.use(express.json());

    // Health check 엔드포인트
    app.get('/healthz', (req, res) => {
      res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
      });
    });

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
    });

    // 서버 종료 시 정리 작업
    process.on('SIGTERM', () => {
      console.log('🔄 서버 종료 신호를 받았습니다. 정리 작업을 시작합니다...');
      server.close(() => {
        console.log('✅ 서버가 정상적으로 종료되었습니다.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ 서버 시작 중 치명적인 오류 발생:', error.message);
    process.exit(1);
  }
}

startServer();