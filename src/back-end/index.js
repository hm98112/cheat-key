// back-end/index.js 예시
const express = require('express');
const app = express();
const usersRouter = require('./scripts/api/users'); // 방금 만든 라우터 파일
const authRouter = require('./src/api/auth'); // 방금 만든 라우터 파일

app.use(express.json()); // JSON 요청 본문을 파싱하기 위해 필요

app.use('/api/users', usersRouter); // '/api/users' 경로로 오는 요청은 usersRouter가 처리

app.use('/api/auth', authRouter); // '/api/auth' 경로로 오는 요청은 authRouter가 처리

app.listen(8080, () => {
  console.log('User service listening on port 8080');
});
