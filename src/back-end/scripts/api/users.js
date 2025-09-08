const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db'); // 데이터베이스 연결 설정

/**
 * POST /api/users/signup
 * - 사용자 회원가입을 처리합니다.
 */
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: '아이디, 이메일, 비밀번호는 필수입니다.' });
  }

  try {
    // 사용자가 이미 존재하는지 확인
    const userExistsQuery = 'SELECT * FROM users WHERE username = $1 OR email = $2';
    const { rows } = await db.query(userExistsQuery, [username, email]);

    if (rows.length > 0) {
      return res.status(409).json({ message: '이미 사용 중인 아이디 또는 이메일입니다.' });
    }

    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 새 사용자 정보를 DB에 저장
    const insertUserQuery = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING user_id, username, created_at;
    `;
    const newUser = await db.query(insertUserQuery, [username, email, passwordHash]);

    res.status(201).json({
      message: '성공적으로 가입되었습니다!',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('회원가입 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 다른 사용자 관련 라우트들을 여기에 추가할 수 있습니다. (예: 프로필 조회, 정보 수정 등)

module.exports = router;