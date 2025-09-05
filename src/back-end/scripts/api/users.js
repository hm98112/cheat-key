const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db'); // 가정: 별도의 파일에서 PostgreSQL 연결 풀(pool)을 설정

const router = express.Router();

// POST /api/users/signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // 1. 요청 데이터 유효성 검사
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  try {
    // 2. 비밀번호 암호화 (bcrypt 사용)
    // salt 라운드 수. 숫자가 높을수록 보안이 강하지만 속도가 느려짐. 보통 10~12 사용.
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. 데이터베이스에 새로운 사용자 정보 저장
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING user_id, username, created_at;
    `;
    const values = [username, email, hashedPassword];

    const { rows } = await db.query(query, values);
    const newUser = rows[0];

    console.log(`New user created: ${newUser.username}`);

    // 4. 성공 응답 반환 (민감 정보 제외)
    res.status(201).json({
      message: 'User created successfully!',
      user: {
        userId: newUser.user_id,
        username: newUser.username,
        email: email,
        createdAt: newUser.created_at,
      },
    });

  } catch (error) {
    // 5. 에러 처리
    // PostgreSQL에서 UNIQUE 제약 조건 위반 시 '23505' 에러 코드를 반환
    if (error.code === '23505') {
      if (error.constraint === 'users_username_key') {
        console.error(`Error: Username already exists - ${username}`);
        return res.status(409).json({ message: '이미 사용중인 닉네임입니다.' }); // 409 Conflict
      }
      
      if (error.constraint === 'users_email_key') {
        console.error(`Error: Email already exists - ${email}`);
        return res.status(409).json({ message: '이미 등록된 이메일입니다.' }); // 409 Conflict
      }
    }

    console.error('Error during user signup:', error);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
});

module.exports = router;

