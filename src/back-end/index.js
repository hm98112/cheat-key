// Node.js 내장 모듈 'path'를 가져옵니다. 파일 및 디렉토리 경로를 안전하게 다루기 위해 사용됩니다.
const path = require('path');
const http = require('http'); // Node.js 내장 http 모듈
const express = require('express');
const cors = require('cors');

// .env 파일의 절대 경로를 명확히 지정하여 로드합니다.
// __dirname은 현재 파일(index.js)이 위치한 디렉토리의 절대 경로를 나타냅니다.
// 이렇게 하면 어떤 위치에서 서버를 실행하더라도 항상 'back-end' 폴더 내의 .env 파일을 정확히 찾습니다.
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 필요한 라이브러리들을 가져옵니다.
const usersRouter = require('./scripts/api/users'); 
const authRouter = require('./scripts/api/auth'); 
const matchmakingRouter = require('./scripts/api/matchmaking');
const { initializeSocket } = require('./scripts/services/socketManager'); // [추가] Socket.IO 초기화 함수
const { startMatchmaking } = require('./scripts/services/matchmaking'); // [추가] 매치메이킹 서비스
const gameResultRouter = require('./scripts/api/gameresult'); 
const gamesRouter = require('./scripts/api/games');


// Express 애플리케이션 생성
const app = express();
const server = http.createServer(app); // [수정] Express 앱으로 http 서버 생성

// 미들웨어 설정
app.use(cors({  origin: "http://localhost:5173", credentials: true, }));
app.use(express.json());


// 서버 시작 시 .env 변수가 제대로 로드되었는지 확인하는 진단 코드
// 서버가 필수 환경 변수 없이 실행되는 것을 방지하여 치명적인 오류를 미리 막아줍니다.
console.log('--- .env 파일 변수 로드 상태 확인 ---');
if (process.env.JWT_SECRET) {
  console.log('✅ JWT_SECRET: 로드 성공');
} else {
  console.error('❌ 중요 오류: .env 파일에서 JWT_SECRET을 찾을 수 없습니다!');
  process.exit(1); // 필수 변수가 없으면 서버 실행을 중단시킵니다.
}




// --- API 라우터 등록 ---
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/matchmaking', matchmakingRouter);
app.use('/api/games', gamesRouter);
app.use('/api/game', gameResultRouter); 

// [추가] 생성된 HTTP 서버에 Socket.IO 서버를 연결하여 초기화합니다.
initializeSocket(server);

// --- 서버 실행 ---
// .env 파일에 PORT가 지정되어 있으면 그 값을 사용하고, 없으면 기본값으로 8080을 사용합니다.
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 포트에서 실행 중입니다.`);
  startMatchmaking();
});



