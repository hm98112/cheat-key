/**
 * @file users.js
 * @brief 사용자 관련 API 라우터 (회원가입 등)
 */

// --- 모듈 임포트 ---
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // 비밀번호 암호화 라이브러리
const db = require('../config/db'); // PostgreSQL 데이터베이스 연결 설정 모듈

/**
 * @route   POST /api/users/signup
 * @desc    새로운 사용자를 등록합니다.
 * @access  Public
 * @body    {string} username - 사용할 닉네임
 * @body    {string} email - 사용할 이메일
 * @body    {string} password - 사용할 비밀번호
 */
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const initialElo = 1200; // 모든 유저에게 부여되는 초기 ELO 점수

    // 1. 요청 데이터 유효성 검사
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    // 데이터베이스 커넥션 풀에서 클라이언트(커넥션) 하나를 가져옵니다.
    const client = await db.connect();

    try {
        // --- 트랜잭션 시작 ---
        // 'users' 테이블과 'user_game_ratings' 테이블에 모두 정상적으로 데이터가 삽입되어야 하므로,
        // 데이터 일관성을 위해 트랜잭션을 사용합니다.
        await client.query('BEGIN');

        // 2. 서비스 중인 모든 게임 종류 조회 (확장성을 위함)
        // 새로운 게임이 추가되더라도, 이 로직을 수정할 필요 없이 모든 신규 유저에게
        // 해당 게임의 초기 ELO 점수가 자동으로 설정됩니다.
            const gameTypesResult = await client.query('SELECT game_type_id FROM game_types;');
        const gameTypes = gameTypesResult.rows;

        // 만약 게임 종류가 하나도 없다면, 서버 설정 오류로 간주하고 예외를 발생시킵니다.
        if (gameTypes.length === 0) {
            throw new Error('No game types found in the database. Cannot set initial ELO ratings.');
        }

        // 3. 비밀번호 암호화
        // 보안을 위해 사용자의 비밀번호는 항상 해시하여 저장합니다.
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. 'users' 테이블에 새로운 사용자 정보 저장
        // RETURNING 절을 사용하여, INSERT 직후 생성된 user_id를 바로 받아옵니다.
        const userQuery = `
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING user_id, username, created_at;
        `;
        const userValues = [username, email, hashedPassword];
        const { rows } = await client.query(userQuery, userValues);
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
            await client.query(eloQuery, eloValues);
            console.log(`  - ELO for game_type_id ${gameType.game_type_id} set to ${initialElo}`);
        }

        // --- 모든 DB 작업이 성공하면 트랜잭션 커밋 ---
        await client.query('COMMIT');

        // 6. 성공 응답 반환
        res.status(201).json({
            message: 'User created successfully!',
            user: {
                userId: newUser.user_id,
                username: newUser.username,
                email: email, // 비밀번호는 응답에서 제외
                createdAt: newUser.created_at,
            },
        });

    } catch (error) {
        // --- 에러 발생 시 트랜잭션 롤백 ---
        // 중간에 하나라도 실패하면, 이전의 모든 DB 작업을 취소합니다.
        await client.query('ROLLBACK');
        console.error('[Signup] Transaction failed. Rolling back changes.');

        // 7. 에러 유형에 따른 분기 처리
        // 데이터베이스의 UNIQUE 제약 조건 위반 오류(코드: 23505)를 감지합니다.
        if (error.code === '23505') {
            // 어떤 제약 조건(constraint)을 위반했는지 확인하여 더 구체적인 에러 메시지를 보냅니다.
            if (error.constraint === 'users_username_key') {
                
                return res.status(409).json({ message: '이미 사용중인 닉네임입니다.' }); // 409 Conflict
            }
            if (error.constraint === 'users_email_key') {
                return res.status(409).json({ message: '이미 등록된 이메일입니다.' });
            }
        }

        // 그 외의 서버 오류 처리
        console.error('Error during user signup:', error);
        res.status(500).json({ message: 'An error occurred on the server.' });

    } finally {
        // --- 사용한 커넥션을 풀에 반환 ---
        // 성공/실패 여부와 관계없이 항상 실행되어 커넥션 누수를 방지합니다.
        client.release();
    }
});

// 설정이 완료된 라우터 객체를 모듈로 내보내 다른 파일(예: app.js)에서 사용할 수 있도록 합니다.
module.exports = router;

