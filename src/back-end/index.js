// index.js

const path = require('path');
const http = require('http');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

// 필요한 라우터 파일들을 가져옵니다.
const usersRouter = require('./scripts/api/users'); 
const authRouter = require('./scripts/api/auth'); 
const matchmakingRouter = require('./scripts/api/matchmaking');
const { initializeSocket } = require('./scripts/services/socketManager');
const { startMatchmaking } = require('./scripts/services/matchmaking');
const gameResultRouter = require('./scripts/api/gameresult'); 
const gamesRouter = require('./scripts/api/games');
const rankingRouter = require('./scripts/api/ranking'); // 랭킹 라우터 임포트


// Express 앱 생성 및 HTTP 서버 연결
const app = express();
const server = http.createServer(app);

// 미들웨어 설정
app.use(cors({ origin: "http://localhost:5173", credentials: true, }));
app.use(express.json());


// .env 변수 로드 상태 확인
console.log('--- .env 파일 변수 로드 상태 확인 ---');
if (process.env.JWT_SECRET) {
    console.log('✅ JWT_SECRET: 로드 성공');
} else {
    console.error('❌ 중요 오류: .env 파일에서 JWT_SECRET을 찾을 수 없습니다!');
    process.exit(1);
}

// --- API 라우터 등록 ---
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/matchmaking', matchmakingRouter);
app.use('/api/games', gamesRouter);
app.use('/api/game', gameResultRouter); 
app.use('/api/ranking', rankingRouter); // 랭킹 라우터 등록


// Socket.IO 초기화
initializeSocket(server);

// --- 서버 실행 ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`✅ 서버가 http://localhost:${PORT} 포트에서 실행 중입니다.`);
    startMatchmaking();
});