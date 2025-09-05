const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // 가정: 별도의 파일에서 PostgreSQL 연결 풀(pool)을 설정
const redisClient = require('../config/redis'); // 가정: 별도의 파일에서 Redis 클라이언트 설정

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
// 1. 요청 데이터 유효성 검사
  if (!identifier || !password) {
    return res.status(400).json({ message: 'identifier and password are required.' });
  }

  try {
    // 2. 데이터베이스에서 사용자 정보 
    
    // 👇 isEmail 변수를 먼저 정의합니다.
    const isEmail = identifier.includes('@');
    
    const query = isEmail
      ? 'SELECT * FROM users WHERE email = $1'
      : 'SELECT * FROM users WHERE username = $1';
    
    const { rows } = await db.query(query, [identifier]);
    
    // 사용자가 존재하지 않는 경우
    if (rows.length === 0) {
      // 보안을 위해 "존재하지 않는 사용자"라는 메시지 대신 "자격 증명 실패"로 통일하는 것이 좋음
      return res.status(401).json({ message: '로그인에 실패했습니다. 아이디, 비밀번호를 확인하세요.' });
    }

    const user = rows[0];

    // 3. 비밀번호 비교 (bcrypt.compare 사용)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    // 비밀번호가 일치하지 않는 경우
    if (!isPasswordValid) {
      return res.status(401).json({ message: '로그인에 실패했습니다. 아이디, 비밀번호를 확인하세요.' });
    }

    // 4. JWT(Access Token) 생성
    const payload = { userId: user.user_id, username: user.username, role: user.role };
      // 필요한 경우 다른 정보 추가 (예: 역할)
    
    // 1. JWT 비밀키는 .env 파일에 저장하고 관리해야 함
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m', 
    });
    // 2. Refresh Token 발급 (유효기간: 7일)
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    console.log(`User logged in: ${user.username}`);

    // 5. 성공 응답 (토큰 포함)
    res.status(200).json({
      message: 'Login successful!',
      accessToken,
      username: user.username,
      refreshToken,    // 로그인한 사용자의 닉네임을 응답에 추가
    });

  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(204).send(); // No Content
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Redis에 "denylist:refreshToken" 형태로 저장하여 무효화
    const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);
    if (remainingTime > 0) {
      await redisClient.set(`denylist:${refreshToken}`, 'logged_out', {
        EX: remainingTime,
      });
    }
    
    console.log(`Token denylisted for user: ${decoded.username}`);
    res.status(200).json({ message: 'Logout successful!' });

  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(400).json({ message: 'Invalid token.' });
  }
});

// POST /api/auth/refresh (Access Token 재발급)
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required.' });
  }

  try {
    // 1. Redis의 Denylist에 토큰이 있는지 확인
    const isDenylisted = await redisClient.get(`denylist:${refreshToken}`);
    if (isDenylisted) {
      return res.status(403).json({ message: 'This refresh token has been invalidated.' });
    }

    // 2. Refresh Token 검증
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // 3. 새로운 Access Token 발급
    const payload = { userId: decoded.userId, username: decoded.username, role: decoded.role };
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({ accessToken: newAccessToken });

  } catch (error) {
    // Refresh Token이 만료되었거나 유효하지 않은 경우
    return res.status(403).json({ message: 'Invalid or expired refresh token.' });
  }
});

module.exports = router;

