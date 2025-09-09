/**
 * @file gameresult.js
 * @brief 게임 결과 처리 및 ELO 레이팅 업데이트 관련 API 라우터
 */

// --- 모듈 임포트 ---
const express = require('express'); // Express 프레임워크 임포트
const router = express.Router(); // 라우터 객체 생성
const db = require('../config/db'); // 데이터베이스 연결 설정 모듈 임포트
const auth = require('../middleware/auth'); // JWT 인증 미들웨어 임포트
const calculateElo = require('../services/rating'); // ELO 레이팅 계산 서비스 모듈 임포트

/**
 * @route   POST /api/gameresult/result
 * @desc    게임 결과를 받아 DB에 저장하고, 참여 유저들의 ELO 레이팅 점수를 업데이트합니다.
 */
router.post('/result', auth, async (req, res) => { // 게임 결과 처리 API 엔드포인트
  // --- ID 값들을 명시적으로 숫자로 변환 ---
  // req.body로 받은 값은 문자열일 수 있으므로, 숫자 타입으로 통일하여 데이터 불일치 문제를 방지합니다.
  const { gameId, gameTypeId, endedAt } = req.body; // 게임 ID, 게임 타입 ID, 종료 시간 추출
  const winnerUserId = req.body.winnerUserId ? parseInt(req.body.winnerUserId, 10) : null; // 승자 ID 숫자 변환
  const participantUserIds = Array.isArray(req.body.participantUserIds)
    ? req.body.participantUserIds.map(id => parseInt(id, 10)) // 참가자 ID 배열 숫자 변환
    : [];

  // --- 1. 입력값 유효성 검사 ---
  if (!gameId || !gameTypeId || !winnerUserId || participantUserIds.length < 2) { // 필수 정보 누락 체크
    return res.status(400).json({ message: '필수 정보가 누락되었습니다.' }); // 오류 응답 반환
  }
  if (participantUserIds.length !== 2) { // 1대1 게임만 처리 가능
    return res.status(400).json({ message: '현재는 1대1 게임 결과만 처리할 수 있습니다.' }); // 오류 응답 반환
  }
  if (!participantUserIds.includes(winnerUserId)) { // 승자가 참가자 목록에 포함되어 있는지 확인
    return res.status(400).json({ message: '승자는 참가자 목록에 포함되어야 합니다.' }); // 오류 응답 반환
  }

  // --- 2. 데이터베이스 트랜잭션 처리 ---
  const client = await db.connect(); // DB 커넥션 획득

  try {
    await client.query('BEGIN'); // 트랜잭션 시작

    // 2-1. 'games' 테이블 업데이트
    const gameUpdateQuery = `
      UPDATE games
      SET status = 'finished', winner_user_id = $1, ended_at = $2
      WHERE game_id = $3
    `; // 게임 종료 정보 업데이트 쿼리
    await client.query(gameUpdateQuery, [winnerUserId, endedAt, gameId]); // 쿼리 실행

    // 2-2. ELO 레이팅 계산 및 업데이트
    const loserUserId = participantUserIds.find(id => id !== winnerUserId); // 패자 ID 추출

    const ratingQuery = `
      SELECT user_id, elo_rating
      FROM user_game_ratings
      WHERE user_id IN ($1, $2) AND game_type_id = $3;
    `; // 두 유저의 기존 ELO 점수 조회 쿼리
    const { rows: ratingRows } = await client.query(ratingQuery, [winnerUserId, loserUserId, gameTypeId]); // 쿼리 실행
    
    // 이제 타입이 일치하므로 정상적으로 ELO 점수를 찾아옵니다.
    const winnerInitialRating = ratingRows.find(r => Number(r.user_id) === winnerUserId)?.elo_rating || 1200; // 승자 기존 ELO
    const loserInitialRating = ratingRows.find(r => Number(r.user_id) === loserUserId)?.elo_rating || 1200; // 패자 기존 ELO

    // 디버깅: console.log(`[ELO PRE] Winner: ${winnerInitialRating}, Loser: ${loserInitialRating}`);

    const { winnerNew, loserNew } = calculateElo(winnerInitialRating, loserInitialRating); // 새 ELO 점수 계산

    // 디버깅: console.log(`[ELO POST] Winner: ${winnerNew}, Loser: ${loserNew}`);
    
    const upsertQuery = `
      INSERT INTO user_game_ratings (user_id, game_type_id, elo_rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, game_type_id) 
      DO UPDATE SET elo_rating = EXCLUDED.elo_rating;
    `; // ELO 점수 upsert 쿼리
    await client.query(upsertQuery, [winnerUserId, gameTypeId, winnerNew]); // 승자 ELO 반영
    await client.query(upsertQuery, [loserUserId, gameTypeId, loserNew]); // 패자 ELO 반영

    // 2-3. 'game_participants' 테이블 업데이트
    const participantUpdateQuery = `
      UPDATE game_participants
      SET final_elo = $1
      WHERE game_id = $2 AND user_id = $3;
    `; // 참가자별 최종 ELO 반영 쿼리
    await client.query(participantUpdateQuery, [winnerNew, gameId, winnerUserId]); // 승자 반영
    await client.query(participantUpdateQuery, [loserNew, gameId, loserUserId]); // 패자 반영

    await client.query('COMMIT'); // 트랜잭션 커밋

    res.status(201).json({ // 성공 응답 반환
      message: '게임 결과 및 레이팅 반영 완료',
      gameId,
      eloChanges: {
        winner: { id: winnerUserId, from: winnerInitialRating, to: winnerNew }, // 승자 ELO 변화
        loser: { id: loserUserId, from: loserInitialRating, to: loserNew }, // 패자 ELO 변화
      }
    });
  } catch (err) {
    await client.query('ROLLBACK'); // 트랜잭션 롤백
    // 디버깅: console.error('ELO 업데이트 트랜잭션 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' }); // 서버 오류 응답
  } finally {
    client.release(); // DB 커넥션 반환
  }
});

module.exports = router; // 라우터 모듈 내보내기
