/**
 * @file games.js
 * @brief 게임 관련 유틸리티 API 라우터 (예: 참여 권한 확인)
 */

// --- 모듈 임포트 ---
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // JWT 인증 미들웨어
const db = require('../config/db');      // 데이터베이스 연결 설정 모듈

/**
 * @route   GET /api/games/:gameId/verify
 * @desc    요청을 보낸 사용자가 특정 게임 ID에 참여할 권한이 있는지 검증합니다.
 * @access  Private (로그인한 유저만 접근 가능)
 * @param   {string} gameId - 검증하고자 하는 게임의 고유 ID
 */
router.get('/:gameId/verify', auth, async (req, res) => {
  // URL 파라미터에서 gameId를 추출합니다.
  const { gameId } = req.params;
  // auth 미들웨어에서 검증 후 추가해준 req.user 객체에서 현재 사용자의 ID를 추출합니다.
  const { userId } = req.user;

  try {
    // 1. 'game_participants' 테이블을 조회하여,
    //    주어진 gameId와 현재 userId가 일치하는 참가 기록이 있는지 확인하는 쿼리입니다
    const query = `
      SELECT 1 FROM game_participants
      WHERE game_id = $1 AND user_id = $2;
    `;
    const { rows } = await db.query(query, [gameId, userId]);

    // 2. 쿼리 결과, 레코드가 없는 경우 (rows.length === 0)
    //    해당 사용자는 이 게임의 참가자가 아니라는 의미입니다.
    if (rows.length === 0) {
      // 403 Forbidden 응답을 보냅니다.
      // (401 Unauthorized는 '인증되지 않음', 403 Forbidden은 '인증은 되었으나 권한이 없음'을 의미)
      return res.status(403).json({ message: '이 게임에 참여할 권한이 없습니다.' });
    }

    // 3. 쿼리 결과, 레코드가 있는 경우
    //    사용자는 게임 참가자가 맞으므로, 접근을 허용합니다.
    // TODO: 향후 게임의 현재 상태(상대방 정보, 점수 등)를 함께 보내주는 로직을 추가하면
    //       클라이언트에서 페이지 진입 시 필요한 정보를 한 번에 받을 수 있어 효율적입니다.
    res.status(200).json({ message: '성공적으로 인증되었습니다.', authorized: true });

  } catch (error) {
    // 서버 처리 중 오류가 발생하면 에러 로그를 기록하고 500 Internal Server Error 응답을 보냅니다.
    console.error('게임 참여자 확인 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 설정이 완료된 라우터 객체를 모듈로 내보냅니다.
module.exports = router;

