const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db'); // 가정: 별도의 파일에서 PostgreSQL 연결 풀(pool)을 설정

// POST /api/users/signup
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const initialElo = 1200;

    // 1. 요청 데이터 유효성 검사
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }


    try {
        // --- 트랜잭션 시작 ---
        await db.query('BEGIN');

        // 2. 서비스 중인 모든 게임 종류 조회 (확장성을 위해 추가)
        const gameTypesResult = await db.query('SELECT game_type_id FROM game_types;');
        const gameTypes = gameTypesResult.rows;

        // 만약 게임 종류가 하나도 없다면 서버 설정 에러이므로 롤백
        if (gameTypes.length === 0) {
            throw new Error('No game types found in the database. Cannot set initial ELO ratings.');
        }

        // 3. 비밀번호 암호화
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. 데이터베이스에 새로운 사용자 정보 저장
        const userQuery = `
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING user_id, username, created_at;
        `;
        const userValues = [username, email, hashedPassword];
        const { rows } = await db.query(userQuery, userValues);
        const newUser = rows[0];
        console.log(`(In Transaction) New user created: ${newUser.username}`);

        // 5. 모든 게임 종류에 대해 초기 ELO 점수 기록
        console.log(`Setting initial ELO scores for user: ${newUser.username}`);
        for (const gameType of gameTypes) {
            const eloQuery = `
                INSERT INTO user_game_ratings (user_id, game_type_id, elo_rating)
                VALUES ($1, $2, $3);
            `;
            const eloValues = [newUser.user_id, gameType.game_type_id, initialElo];
            await db.query(eloQuery, eloValues);
            console.log(`  - ELO for game_type_id ${gameType.game_type_id} set to ${initialElo}`);
        }

        // --- 모든 쿼리가 성공하면 트랜잭션 커밋 ---
        await db.query('COMMIT');

        // 6. 성공 응답 반환
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
        // --- 에러 발생 시 트랜잭션 롤백 ---
        await db.query('ROLLBACK');
        console.error('Transaction failed. Rolling back changes.');

        // 7. 에러 처리
        if (error.code === '23505') { // UNIQUE constraint violation
            if (error.constraint === 'users_username_key') {
                return res.status(409).json({ message: '이미 사용중인 닉네임입니다.' });
            }
            if (error.constraint === 'users_email_key') {
                return res.status(409).json({ message: '이미 등록된 이메일입니다.' });
            }
        }

        console.error('Error during user signup:', error);
        res.status(500).json({ message: 'An error occurred on the server.' });

    } finally {
        // --- 사용한 클라이언트를 풀에 반환 ---

    }
});

module.exports = router;

