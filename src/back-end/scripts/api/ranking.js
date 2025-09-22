// back-end/scripts/api/ranking.js

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
        const query = `
            SELECT
                u.username,
                ugr.elo_rating
            FROM
                user_game_ratings AS ugr
            JOIN
                users AS u ON u.user_id = ugr.user_id
            WHERE
                ugr.game_type_id = 1
            ORDER BY
                ugr.elo_rating DESC
            LIMIT 10;
        `;

        const { rows } = await db.query(query);

        res.status(200).json(rows);

    } catch (error) {
        console.error('랭킹 데이터 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버에서 오류가 발생했습니다.' });
    }
});

module.exports = router;