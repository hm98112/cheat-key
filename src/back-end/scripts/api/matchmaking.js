const express = require('express');
const router = express.Router();
const db = require('../config/db'); // PostgreSQL 연결 풀
const redisClient = require('../config/redis'); // Redis 클라이언트
const auth = require('../middleware/auth'); // 인증 미들웨어

/**
 * POST /api/matchmaking/queue
 * 사용자를 매칭 대기열에 추가합니다.
 * 이 라우트는 'auth' 미들웨어에 의해 보호됩니다.
 */
router.post('/queue', auth, async (req, res) => {
  // 1. 요청 본문에서 gameTypeId를, 인증 미들웨어로부터 user_id를 가져옵니다.
  const { gameTypeId } = req.body;
  const userId = req.user.userId; // auth 미들웨어가 req.userId에 payload를 넣어줌

  if (!gameTypeId) {
    return res.status(400).json({ message: 'gameTypeId가 필요합니다.' });
  }

  try {
    // 2. PostgreSQL에서 사용자의 현재 ELO 점수를 조회합니다.
    const ratingQuery = `
      SELECT elo_rating FROM user_game_ratings 
      WHERE user_id = $1 AND game_type_id = $2;
    `;
    const { rows } = await db.query(ratingQuery, [userId, gameTypeId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: '해당 게임에 대한 ELO 점수를 찾을 수 없습니다.' });
    }
    const eloRating = rows[0].elo_rating;
    console.log(`사용자 ${userId}의 ELO 점수(${eloRating})를 조회했습니다.`);

    // 3. Redis Sorted Set을 사용하여 대기열에 사용자를 추가합니다.
    //    Key: game_type_id를 포함하여 게임별로 대기열을 구분합니다.
    //    rating: ELO 점수 (Sorted Set은 점수를 기준으로 멤버를 정렬합니다)
    //    Value: 사용자 ID
    const queueKey = `matchmaking_queue:game_type:${gameTypeId}`;
    await redisClient.zAdd(queueKey, {
      score: eloRating,
      value: String(userId) // Redis 멤버는 문자열이어야 합니다.
    });
    console.log(`사용자 ${userId}를 Redis 대기열(${queueKey})에 추가했습니다.`);

    // 4. 클라이언트에 성공 응답을 보냅니다.
    res.status(200).json({ message: '매칭 대기열에 정상적으로 진입했습니다.' });

  } catch (error) {
    console.error('매칭 대기열 추가 중 오류 발생:', error);
    res.status(500).json({ message: '서버에서 오류가 발생했습니다.' });
  }
});

module.exports = router;
