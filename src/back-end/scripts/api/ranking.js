// --- START: back-end/scripts/api/ranking.js (새 파일) ---
/**
 * @file ranking.js
 * @brief 게임 랭킹 조회 관련 API 라우터
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @route   GET /api/ranking
 * @desc    테트리스 게임(game_type_id = 1)의 ELO 점수 기준 상위 10명 랭킹을 조회합니다.
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        // user_game_ratings 테이블과 users 테이블을 조인하여
        // ELO 점수가 높은 순서대로 상위 10명의 닉네임과 ELO 점수를 가져옵니다.
        const query = `
            SELECT
                u.username,
                ugr.elo_rating
            FROM
                user_game_ratings AS ugr
            JOIN
                users AS u ON u.user_id = ugr.user_id
            WHERE
                ugr.game_type_id = 1 -- 'Tetris' 게임 타입 ID
            ORDER BY
                ugr.elo_rating DESC
            LIMIT 10;
        `;

        const { rows } = await db.query(query);

        // 조회된 랭킹 데이터를 클라이언트에 JSON 형태로 반환합니다.
        res.status(200).json(rows);

    } catch (error) {
        console.error('랭킹 데이터 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버에서 오류가 발생했습니다.' });
    }
});

module.exports = router;
// --- END: back-end/scripts/api/ranking.js (새 파일) ---