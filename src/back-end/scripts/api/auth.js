const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const redisClient = require('../config/redis');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: 'identifier and password are required.' });
  }

  try {
    const isEmail = identifier.includes('@');
    const query = isEmail
      ? 'SELECT * FROM users WHERE email = $1'
      : 'SELECT * FROM users WHERE username = $1';

    const { rows } = await db.query(query, [identifier]);

    if (rows.length === 0) {
      return res.status(401).json({ message: '로그인에 실패했습니다. 아이디, 비밀번호를 확인하세요.' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: '로그인에 실패했습니다. 아이디, 비밀번호를 확인하세요.' });
    }

    const payload = { userId: user.user_id, username: user.username, role: user.role };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    console.log(`User logged in: ${user.username}`);

    // [수정] 성공 응답에 'userId'를 반드시 포함시킵니다.
    res.status(200).json({
      message: 'Login successful!',
      accessToken,
      refreshToken,
      userId: user.user_id, // 이 부분이 가장 중요합니다.
      username: user.username,
    });
    // const responseData = {
    //   message: 'Login successful!',
    //   accessToken,
    //   refreshToken,
    //   userId: user.user_id,
    //   username: user.username,
    // };
    // console.log('[DEBUG] Sending login response data:', responseData);
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
});

// ... (로그아웃, 토큰 재발급 라우트는 기존과 동일) ...
// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(204).send(); // No Content
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

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
    const isDenylisted = await redisClient.get(`denylist:${refreshToken}`);
    if (isDenylisted) {
      return res.status(403).json({ message: 'This refresh token has been invalidated.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const payload = { userId: decoded.userId, username: decoded.username, role: decoded.role };
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({ accessToken: newAccessToken });

  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired refresh token.' });
  }
});


module.exports = router;
