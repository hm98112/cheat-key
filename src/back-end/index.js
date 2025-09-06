// Node.js 내장 모듈 'path'를 가져옵니다. 파일 및 디렉토리 경로를 안전하게 다루기 위해 사용됩니다.
const path = require('path');
const http = require('http'); // Node.js 내장 http 모듈
const { initializeWebSocket } = require('./scripts/services/webSocket'); 
const { startMatchmakingService } = require('./scripts/services/matchmaking');


// .env 파일의 절대 경로를 명확히 지정하여 로드합니다.
// __dirname은 현재 파일(app.js)이 위치한 디렉토리의 절대 경로를 나타냅니다.
// 이렇게 하면 어떤 위치에서 서버를 실행하더라도 항상 'back-end' 폴더 내의 .env 파일을 정확히 찾습니다.
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 서버 시작 시 .env 변수가 제대로 로드되었는지 확인하는 진단 코드
// 서버가 필수 환경 변수 없이 실행되는 것을 방지하여 치명적인 오류를 미리 막아줍니다.
console.log('--- .env 파일 변수 로드 상태 확인 ---');
if (process.env.JWT_SECRET) {
  console.log('✅ JWT_SECRET: 로드 성공');
} else {
  console.error('❌ 중요 오류: .env 파일에서 JWT_SECRET을 찾을 수 없습니다!');
  console.error('   => /src/back-end/ 폴더에 .env 파일이 있는지, 변수가 올바르게 설정되었는지 확인하세요.');
  process.exit(1); // 필수 변수가 없으면 서버 실행을 중단시킵니다.
}
console.log('-------------------------------------------');

// 필요한 라이브러리들을 가져옵니다.
const express = require('express');
const cors = require('cors'); // 다른 출처(도메인)의 프론트엔드 요청을 허용하기 위한 미들웨어

// Express 애플리케이션 생성
const app = express();
const server = http.createServer(app); // [수정] Express 앱으로 http 서버 생성

initializeWebSocket(server);

// API 라우터들의 경로를 일관성 있게 수정합니다.
// 일반적으로 API 로직은 'api' 폴더에 모아 관리하는 것이 표준적입니다.
const usersRouter = require('./scripts/api/users');
const authRouter = require('./scripts/api/auth');
const matchmakingRouter = require('./scripts/api/matchmaking');

// --- 미들웨어(Middleware) 설정 ---
// 1. CORS 미들웨어: 모든 출처에서의 요청을 허용합니다. (개발 환경)
//    실제 배포 시에는 보안을 위해 특정 프론트엔드 도메인만 허용하는 것이 좋습니다.
//    ex) app.use(cors({ origin: 'http://your-frontend-domain.com' }));
app.use(cors());

// 2. JSON 파싱 미들웨어: 요청 본문(body)이 JSON 형식일 경우 이를 파싱하여 req.body 객체로 만들어줍니다.
app.use(express.json());


// --- API 라우터 등록 ---
// '/api/users' 경로로 들어오는 요청은 usersRouter가 처리합니다.
app.use('/api/users', usersRouter);

// '/api/auth' 경로로 들어오는 요청은 authRouter가 처리합니다.
app.use('/api/auth', authRouter);

// '/api/matchmaking' 경로로 들어오는 요청은 matchmakingRouter가 처리합니다.
app.use('/api/matchmaking', matchmakingRouter);


// --- 서버 실행 ---
// .env 파일에 PORT가 지정되어 있으면 그 값을 사용하고, 없으면 기본값으로 8080을 사용합니다.
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 포트에서 실행 중입니다.`);
  startMatchmakingService();
});



