/**
 * @file matchmaking.js
 * @brief 사용자 매칭 대기열 등록 관련 API 라우터
 */

// --- 모듈 임포트 ---
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // PostgreSQL 데이터베이스 연결 설정 모듈
const redisClient = require('../config/redis'); // Redis 클라이언트 연결 설정 모듈
const auth = require('../middleware/auth'); // JWT 인증 미들웨어

/**
 * @route   POST /api/matchmaking/queue
 * @desc    사용자를 특정 게임의 매칭 대기열에 추가합니다.
 * @access  Private (로그인한 유저만 접근 가능)
 * @body    {number} gameTypeId - 매칭을 원하는 게임의 종류 ID
 */
router.post('/queue', auth, async (req, res) => {
  // 1. 요청 정보 추출
  // 요청 본문에서 gameTypeId를, 인증 미들웨어를 통과하며 req.user에 저장된 사용자 정보에서 userId를 가져옵니다.
  const { gameTypeId } = req.body;
  const userId = req.user.userId;

  // gameTypeId가 요청에 포함되지 않은 경우, 400 Bad Request 오류를 반환합니다.
  if (!gameTypeId) {
    return res.status(400).json({ message: 'gameTypeId가 필요합니다.' });
  }

  try {
    // 2. PostgreSQL에서 사용자의 ELO 점수 조회
    // 매칭의 기준이 되는 사용자의 현재 ELO 점수를 'user_game_ratings' 테이블에서 가져옵니다.
    const ratingQuery = `
      SELECT elo_rating FROM user_game_ratings 
      WHERE user_id = $1 AND game_type_id = $2;
    `;
    const { rows } = await db.query(ratingQuery, [userId, gameTypeId]);

    // 해당 게임에 대한 ELO 점수 기록이 없는 경우, 404 Not Found 오류를 반환합니다.
    // (정상적인 경우라면, 유저는 최소 기본 점수(1200)를 가지고 있어야 합니다.)
    if (rows.length === 0) {
      return res.status(404).json({ message: '해당 게임에 대한 ELO 점수를 찾을 수 없습니다.' });
    }
    const eloRating = rows[0].elo_rating;
    console.log(`[Matchmaking] 사용자 ${userId}의 ELO 점수(${eloRating})를 조회했습니다.`);

    // 3. Redis Sorted Set에 사용자 추가
    // Redis의 Sorted Set은 점수(score)를 기준으로 멤버(value)를 자동 정렬하는 자료구조입니다.
    // ELO 점수를 score로 사용하면, 비슷한 점수대의 사용자를 효율적으로 찾을 수 있습니다.
    const queueKey = `matchmaking_queue:game_type:${gameTypeId}`; // 게임별로 대기열을 구분하기 위한 Key
    await redisClient.zAdd(queueKey, {
      score: eloRating,      // 정렬 기준이 될 ELO 점수
      value: String(userId)  // 대기열에 추가할 사용자 ID (Redis 멤버는 문자열이어야 함)
    });
    console.log(`[Matchmaking] 사용자 ${userId}를 Redis 대기열(${queueKey})에 추가했습니다.`);

    // 4. 클라이언트에 성공 응답 전송
    res.status(200).json({ message: '매칭 대기열에 정상적으로 진입했습니다.' });

  } catch (error) {
    // 서버 처리 중 오류 발생 시 에러 로그를 기록하고 500 Internal Server Error 응답을 보냅니다.
    console.error('매칭 대기열 추가 중 오류 발생:', error);
    res.status(500).json({ message: '서버에서 오류가 발생했습니다.' });
  }
});

// 설정이 완료된 라우터 객체를 모듈로 내보냅니다.
module.exports = router;
