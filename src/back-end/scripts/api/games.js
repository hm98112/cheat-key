/**
 * @file games.js
 * @brief 게임 관련 API 라우터 (참여 권한 확인, 게임 결과 처리)
 */

// --- 1. 모듈 임포트 (파일 최상단) ---
const express = require('express');
const auth = require('../middleware/auth');
const db = require('../config/db');
const calculateElo = require('../services/rating.js'); // 순수 계산 함수를 불러옵니다.

// --- 2. router 선언 (파일 당 딱 한 번만!) ---
const router = express.Router();

/**
 * @route   GET /api/games/:gameId/verify
 * @desc    요청을 보낸 사용자가 특정 게임 ID에 참여할 권한이 있는지 검증합니다.
 * @access  Private
 */
router.get('/:gameId/verify', auth, async (req, res) => {
  const { gameId } = req.params;
  const { userId } = req.user;

  try {
    const query = `
      SELECT 1 FROM game_participants
      WHERE game_id = $1 AND user_id = $2;
    `;
    const { rows } = await db.query(query, [gameId, userId]);

    if (rows.length === 0) {
      return res.status(403).json({ message: '이 게임에 참여할 권한이 없습니다.' });
    }
    res.status(200).json({ message: '성공적으로 인증되었습니다.', authorized: true });

  } catch (error) {
    console.error('게임 참여자 확인 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/games/result
 * @desc    게임 결과를 받아 DB에 기록하고, 레이팅을 업데이트한 후 결과를 반환합니다.
 * @access  Private
 */
router.post('/result', auth, async (req, res) => {
    const requesterUserId = req.user.userId;
    const {
        gameTypeId,
        winnerUserId,
        loserUserId,
        endedAt,
        gameId
    } = req.body;

    const client = await db.connect();

    try {
        await client.query('BEGIN'); // --- 트랜잭션 시작 ---

        // 1. DB에서 승자와 패자의 현재 ELO 레이팅을 직접 조회합니다.
        const getRatingsQuery = `
            SELECT user_id, elo_rating FROM user_game_ratings 
            WHERE game_type_id = $1 AND user_id IN ($2, $3);
        `;
        const { rows: ratingRows } = await client.query(getRatingsQuery, [gameTypeId, winnerUserId, loserUserId]);

        const winnerOldRating = ratingRows.find(r => r.user_id === winnerUserId)?.elo_rating || 1200;
        const loserOldRating = ratingRows.find(r => r.user_id === loserUserId)?.elo_rating || 1200;

        // 2. 순수한 '계산기'인 rating.js를 호출하여 새 점수를 계산합니다.
        const { winnerNew, loserNew } = calculateElo(winnerOldRating, loserOldRating);

        // 3. 'user_game_ratings' 테이블에 계산된 새 점수를 직접 업데이트합니다.
        const updateWinnerQuery = `UPDATE user_game_ratings SET elo_rating = $1 WHERE user_id = $2 AND game_type_id = $3;`;
        await client.query(updateWinnerQuery, [winnerNew, winnerUserId, gameTypeId]);
        
        const updateLoserQuery = `UPDATE user_game_ratings SET elo_rating = $1 WHERE user_id = $2 AND game_type_id = $3;`;
        await client.query(updateLoserQuery, [loserNew, loserUserId, gameTypeId]);

        // 4. 'games' 테이블을 업데이트합니다.
        const updateGameQuery = `UPDATE games SET status = 'completed', winner_user_id = $1, ended_at = $2 WHERE game_id = $3;`;
        await client.query(updateGameQuery, [winnerUserId, endedAt, gameId]);

        // 5. 'game_participants' 테이블에 ELO 변화를 기록합니다.
        const insertParticipantQuery = `INSERT INTO game_participants (game_id, user_id, initial_elo, final_elo) VALUES ($1, $2, $3, $4);`;
        await client.query(insertParticipantQuery, [gameId, winnerUserId, winnerOldRating, winnerNew]);
        await client.query(insertParticipantQuery, [gameId, loserUserId, loserOldRating, loserNew]);

        await client.query('COMMIT'); // --- 트랜잭션 커밋 ---

        // 6. 요청자에게 보낼 결과 데이터를 정리하여 응답합니다.
        const ratingChange = (requesterUserId === winnerUserId) ? (winnerNew - winnerOldRating) : (loserNew - loserOldRating);
        const finalRating = (requesterUserId === winnerUserId) ? winnerNew : loserNew;

        res.status(200).json({
            message: '게임 결과가 성공적으로 처리되었습니다.',
            oldRating: (requesterUserId === winnerUserId) ? winnerOldRating : loserOldRating,
            newRating: finalRating,
            ratingChange: ratingChange,
        });

    } catch (error) {
        await client.query('ROLLBACK'); // --- 오류 발생 시 롤백 ---
        console.error('게임 결과 처리 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    } finally {
        client.release(); // --- DB 클라이언트 반환 ---
    }
});

// --- 4. 모듈 내보내기 (파일 최하단) ---
module.exports = router;