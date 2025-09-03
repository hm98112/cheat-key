require('dotenv').config();

// back-end/index.js 예시
const express = require('express');
const app = express();
const usersRouter = require('./scripts/api/users'); // 방금 만든 라우터 파일
const authRouter = require('./scripts/api/auth'); // 방금 만든 라우터 파일

const cors = require('cors'); // 개발 중 CORS 문제를 피하기 위해 추가

// Middleware 설정
app.use(cors()); // 모든 출처의 요청을 허용 (개발용)

app.use(express.json()); // JSON 요청 본문을 파싱하기 위해 필요

app.use('/api/users', usersRouter); // '/api/users' 경로로 오는 요청은 usersRouter가 처리

app.use('/api/auth', authRouter); // '/api/auth' 경로로 오는 요청은 authRouter가 처리

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('User service listening on port PORT');
});
