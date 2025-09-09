/**
 * @file auth.js
 * @brief 사용자 인증(로그인, 로그아웃, 토큰 재발급) 관련 API 라우터
 */

// --- 모듈 임포트 ---
const express = require('express'); // Express.js 웹 프레임워크
const bcrypt = require('bcrypt'); // 비밀번호 해싱 라이브러리
const jwt = require('jsonwebtoken'); // JSON Web Token(JWT) 생성 및 검증 라이브러리
const db = require('../config/db'); // 데이터베이스 연결 설정 모듈
const redisClient = require('../config/redis'); // Redis 클라이언트 연결 설정 모듈

// --- 라우터 초기화 ---
const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    사용자 로그인 처리
 * @access  Public
 * @body    {string} identifier - 사용자 이메일 또는 유저네임
 * @body    {string} password - 사용자 비밀번호
 */
router.post('/login', async (req, res) => {
  // 요청 본문에서 식별자(identifier)와 비밀번호(password)를 추출합니다.  
  const { identifier, password } = req.body;
  // 필수 필드가 누락된 경우, 400 Bad Request 응답을 보냅니다.
  if (!identifier || !password) {
    return res.status(400).json({ message: 'identifier and password are required.' });
  }

  try {
    // 식별자에 '@'가 포함되어 있는지 여부로 이메일/유저네임을 구분합니다.
    const isEmail = identifier.includes('@');
    // 구분된 타입에 따라 적절한 데이터베이스 쿼리를 선택합니다
    const query = isEmail
      ? 'SELECT * FROM users WHERE email = $1'
      : 'SELECT * FROM users WHERE username = $1';
    
      // 데이터베이스에 사용자 정보 조회를 요청합니다.
    const { rows } = await db.query(query, [identifier]);

    // 조회된 사용자가 없으면, 401 Unauthorized 응답을 보냅니다.
    if (rows.length === 0) {
      return res.status(401).json({ message: '로그인에 실패했습니다. 아이디, 비밀번호를 확인하세요.' });
    }

    const user = rows[0];
    // bcrypt.compare를 사용해 입력된 비밀번호와 DB에 저장된 해시 비밀번호를 비교합니다.
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    // 비밀번호가 일치하지 않으면, 401 Unauthorized 응답을 보냅니다.
    if (!isPasswordValid) {
      return res.status(401).json({ message: '로그인에 실패했습니다. 아이디, 비밀번호를 확인하세요.' });
    }

    // JWT에 담을 페이로드(payload)를 정의합니다. (사용자 ID, 유저네임, 역할 등)
    const payload = { userId: user.user_id, username: user.username, role: user.role };

    // Access Token을 생성합니다. (유효기간: 15분)
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    // Refresh Token을 생성합니다. (유효기간: 7일)
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    console.log(`User logged in: ${user.username}`);

    // 로그인 성공 시, 200 OK 상태 코드와 함께 토큰 및 사용자 정보를 응답합니다.
    res.status(200).json({
      message: 'Login successful!',
      accessToken,
      refreshToken,
      userId: user.user_id,
      username: user.username,
    });
  } catch (error) {
    // 서버 처리 중 오류가 발생하면 에러 로그를 기록하고 500 Internal Server Error 응답을 보냅니다.
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    사용자 로그아웃 처리
 * @access  Private (Valid refresh token required)
 * @body    {string} refreshToken - 무효화할 Refresh Token
 */
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  // Refresh Token이 없으면 별도 처리 없이 204 No Content 응답을 보냅니다.
  if (!refreshToken) {
    return res.status(204).send();
  }

  try {
    // Refresh Token을 검증하여 페이로드를 디코딩합니다.
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // 토큰의 남은 유효 시간을 계산합니다. (만료 시각 - 현재 시각)
    const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);

    // 토큰이 아직 유효하다면, Redis의 'denylist'(블랙리스트)에 추가하여 재사용을 막습니다.
    if (remainingTime > 0) {
      await redisClient.set(`denylist:${refreshToken}`, 'logged_out', {
        EX: remainingTime, // 남은 유효 시간 동안만 저장
      });
    }

    console.log(`사용자 로그아웃 처리 (토큰 무효화): ${decoded.username}`);
    res.status(200).json({ message: 'Logout successful!' });

  } catch (error) {
    // 토큰 검증에 실패하면 (유효하지 않거나 만료된 토큰), 에러 로그를 기록하고 400 Bad Request 응답을 보냅니다.
    console.error('로그아웃 처리 중 오류 발생:', error.message);
    res.status(400).json({ message: 'Invalid token.' });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Access Token 재발급
 * @access  Public (Valid refresh token required)
 * @body    {string} refreshToken - Access Token 재발급에 사용할 Refresh Token
 */
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  // Refresh Token이 없으면, 401 Unauthorized 응답을 보냅니다.
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required.' });
  }

  try {
    // Redis의 'denylist'를 조회하여 해당 토큰이 로그아웃 시 무효화되었는지 확인합니다.
    const isDenylisted = await redisClient.get(`denylist:${refreshToken}`);
    if (isDenylisted) {
    // 무효화된 토큰인 경우, 403 Forbidden 응답을 보냅니다.
      return res.status(403).json({ message: 'This refresh token has been invalidated.' });
    }

    // Refresh Token을 검증하여 페이로드를 디코딩합니다.
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // 새로운 Access Token에 사용할 페이로드를 다시 구성합니다.
    const payload = { userId: decoded.userId, username: decoded.username, role: decoded.role };
    // 새로운 Access Token을 생성합니다. (유효기간: 15분)
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

    // 새로운 Access Token을 200 OK 응답으로 보냅니다.
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    // Refresh Token이 유효하지 않거나 만료된 경우, 403 Forbidden 응답을 보냅니다.
    return res.status(403).json({ message: 'Invalid or expired refresh token.' });
  }
});

// 설정이 완료된 라우터 객체를 모듈로 내보냅니다.
module.exports = router;
