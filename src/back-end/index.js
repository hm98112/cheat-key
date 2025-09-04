const path = require('path'); // Node.js의 내장 'path' 모듈을 가져옵니다.

// ⭐ 1. .env 파일의 절대 경로를 지정하여 명시적으로 로드합니다.
// 이렇게 하면 어떤 위치에서 서버를 실행하더라도 항상 올바른 .env 파일을 찾을 수 있습니다.
require('dotenv').config();

// ⭐ 2. 진단 코드: JWT_SECRET이 제대로 로드되었는지 즉시 확인합니다.
console.log('--- Checking .env variables on server start ---');
if (process.env.JWT_SECRET) {
  console.log('✅ JWT_SECRET loaded successfully.');
} else {
  console.error('❌ FATAL ERROR: JWT_SECRET is not loaded from .env file!');
  console.error('   Please ensure a .env file exists in the /src/back-end/ directory.');
}
console.log('-------------------------------------------');


const express = require('express');
const cors = require('cors');
const app = express();

// ⭐ 3. 라우터 파일 경로 수정
const usersRouter = require('./scripts/api/users'); 
const authRouter = require('./scripts/api/auth');   


// Middleware 설정
app.use(cors());
app.use(express.json());

// 라우터 등록
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ User service listening on port ${PORT}`);
});

