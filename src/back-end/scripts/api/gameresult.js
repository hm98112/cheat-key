const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const calculateElo = require('../services/rating'); // ELO 계산 함수(추후 구현)

/**
 * POST /api/game/result
 * 게임 결과를 저장하고 레이팅 점수를 반영
 * body: { gameTypeId, winnerUserId, participantUserIds: [], startedAt, endedAt }
 */
router.post('/result', auth, async (req, res) => {
  const { gameId, gameTypeId, winnerUserId, participantUserIds, endedAt } = req.body;

  // 기본 유효성 검사
  // 1. 필수 정보가 모두 있는지 확인
  if (!gameId || !gameTypeId || !winnerUserId || !participantUserIds || participantUserIds.length < 2) {
    return res.status(400).json({ message: '필수 정보가 누락되었습니다.' });
  }

  // 2. 2인 게임인지 확인
  if (participantUserIds.length !== 2) {
    return res.status(400).json({ message: '현재는 1대1 게임 결과만 처리할 수 있습니다.' });
  }
  // 3. 승자가 참가자 목록에 있는지 확인
  if (!participantUserIds.includes(winnerUserId)) {
    return res.status(400).json({ message: '승자는 참가자 목록에 포함되어야 합니다.' });
  }

  // 데이터 일관성을 위해 트랜잭션 시작
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 1. 게임 결과 저장
    const gameUpdate = `
      UPDATE games
      SET status = 'finished', winner_user_id = $1, ended_at = $2
      WHERE game_id = $3
    `;
    const gameResult = await client.query(gameUpdate, [winnerUserId, endedAt, gameId]);

    // 2. 레이팅 점수 계산 및 DB 반영
    const loserUserId = participantUserIds.find(id => id !== winnerUserId);

    // 2-1. 참가자들의 기존 ELO 점수 조회 (기본값 1200)
    const ratingQuery = `
      SELECT user_id, elo_rating
      FROM user_game_ratings
      WHERE user_id IN ($1, $2) AND game_type_id = $3;
    `;


    const { rows: ratingRows } = await client.query(ratingQuery, [winnerUserId, loserUserId, gameTypeId]);
    const winnerInitialRating = ratingRows.find(r => r.user_id === winnerUserId)?.elo_rating || 1200;
    const loserInitialRating = ratingRows.find(r => r.user_id === loserUserId)?.elo_rating || 1200;


    // 2-2.새 점수 계산
    const { winnerNew, loserNew } = calculateElo(winnerInitialRating, loserInitialRating);
    // 2-3. 'user_game_ratings' 테이블에 UPSERT (UPDATE or INSERT) 로직 실행
    const upsertQuery = `
      INSERT INTO user_game_ratings (user_id, game_type_id, elo_rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, game_type_id) 
      DO UPDATE SET elo_rating = EXCLUDED.elo_rating;
    `;

    await client.query(upsertQuery, [winnerUserId, gameTypeId, winnerNew]);
    await client.query(upsertQuery, [loserUserId, gameTypeId, loserNew]);

    // 3. 'game_participants' 테이블에 시작/종료 ELO 점수와 함께 정보 저장
    const participantUpdateQuary = `
      UPDATE game_participants
      SET final_elo = $1
      WHERE game_id = $2 AND user_id = $3;
    `;
    await client.query(participantUpdateQuary, [winnerNew, gameId, winnerUserId]);
    await client.query(participantUpdateQuary, [loserNew, gameId, loserUserId]);


    // 4. 모든 쿼리가 성공하면 트랜잭션 커밋
    await client.query('COMMIT');
    res.status(201).json({
      message: '게임 결과 및 레이팅 반영 완료',
      gameId,
      eloChanges: {
        winner: { id: winnerUserId, from: winnerInitialRating, to: winnerNew },
        loser: { id: loserUserId, from: loserInitialRating, to: loserNew },
      }
    });
  } catch (err) {
    // 오류 발생 시 롤백
    await client.query('ROLLBACK');
    console.error('ELO 업데이트 트랜잭션 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  } finally {
    // 사용한 커넥션 반환
    client.release();
  }
});

module.exports = router;
