const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // 인증 미들웨어
const db = require('../config/db');       // 데이터베이스 연결

/**
 * GET /api/games/:gameId/verify
 * - 사용자가 특정 게임에 참여할 권한이 있는지 확인합니다.
 */
router.get('/:gameId/verify', auth, async (req, res) => {
  const { gameId } = req.params;
  const { userId } = req.user; // auth 미들웨어가 넣어준 현재 사용자의 ID

  try {
    // 1. game_participants 테이블에서 해당 게임에 현재 사용자가 있는지 확인합니다.
    const query = `
      SELECT 1 FROM game_participants
      WHERE game_id = $1 AND user_id = $2;
    `;
    const { rows } = await db.query(query, [gameId, userId]);

    // 2. 참여자가 아닐 경우 (결과가 0개일 경우)
    if (rows.length === 0) {
      // 403 Forbidden: 인증은 되었으나 리소스에 접근할 권한이 없음
      return res.status(403).json({ message: '이 게임에 참여할 권한이 없습니다.' });
    }

    // 3. 참여자가 맞을 경우
    // TODO: 게임의 현재 상태(상대방 정보, 점수 등)를 함께 보내주면 더 좋습니다.
    res.status(200).json({ message: '성공적으로 인증되었습니다.', authorized: true });

  } catch (error) {
    console.error('게임 참여자 확인 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;

