// services/matchmakingService.js

const redisClient = require('../config/redis');
const { sendMessageToUser } = require('./webSocket');

// 매칭을 시도하는 주기 (밀리초 단위, 예: 5초)
const MATCHMAKING_INTERVAL = 5000;

// ELO 점수 허용 범위 (예: ±50점)
const ELO_RANGE = 50;

/**
 * 매칭 로직을 주기적으로 실행하는 함수
 */
async function runMatchmaking() {
  console.log('[Matchmaking] Running matchmaking cycle...');

  try {
    const gameTypeId = 1; // 현재는 Tetris(ID: 1)만 처리
    const queueKey = `matchmaking_queue:game_type:${gameTypeId}`;

    // 1. 대기열에 있는 모든 사용자를 가져옵니다 (ELO 점수 순으로 정렬됨).
    // ZRANGEBYSCORE key -inf +inf WITHSCORES
    const players = await redisClient.zRangeWithScores(queueKey, 0, -1);
    
    if (players.length < 2) {
      console.log('[Matchmaking] Not enough players to match. Waiting...');
      return;
    }

    // 2. 플레이어 목록을 순회하며 매칭을 시도합니다.
    while (players.length >= 2) {
      const player1 = players.shift(); // 가장 오래 기다린 플레이어 (또는 ELO가 가장 낮은)
      let matchedPlayer = null;
      let matchedIndex = -1;

      // 3. player1과 ELO 점수가 비슷한 상대를 찾습니다.
      for (let i = 0; i < players.length; i++) {
        const player2 = players[i];
        if (Math.abs(player1.score - player2.score) <= ELO_RANGE) {
          matchedPlayer = player2;
          matchedIndex = i;
          break; // 가장 먼저 찾은 상대와 매칭
        }
      }

      if (matchedPlayer) {
        // 4. 매칭 성공!
        // - players 배열에서 매칭된 상대방을 제거합니다.
        players.splice(matchedIndex, 1);
        
        const player1Id = player1.value;
        const player2Id = matchedPlayer.value;

        // - Redis 대기열에서도 두 플레이어를 제거합니다.
        await redisClient.zRem(queueKey, [player1Id, player2Id]);

        console.log(`[Matchmaking] Match FOUND! Player ${player1Id} (ELO: ${player1.score}) vs Player ${player2Id} (ELO: ${matchedPlayer.score})`);

        // TODO: 데이터베이스에 새로운 게임 세션을 생성하고 gameId를 받아와야 합니다.
        const gameId = Math.floor(Math.random() * 10000); // 임시 게임 ID

        // 5. WebSocket을 통해 두 플레이어에게 매칭 성공 알림을 보냅니다.
        const matchData = {
          type: 'MATCH_SUCCESS',
          payload: {
            gameId,
            opponent: { userId: player2Id, elo: matchedPlayer.score },
          },
        };
        sendMessageToUser(player1Id, matchData);

        matchData.payload.opponent = { userId: player1Id, elo: player1.score };
        sendMessageToUser(player2Id, matchData);

      } else {
        // player1과 매칭할 상대가 없으면, 다음 순회까지 대기
        // (이미 player1은 players 배열에서 제거되었으므로, 다시 배열에 넣을 필요 없음)
      }
    }

  } catch (error) {
    console.error('[Matchmaking] Error during matchmaking cycle:', error);
  }
}

/**
 * 매치메이킹 서비스를 시작합니다.
 */
function startMatchmakingService() {
  console.log('✅ Matchmaking service started.');
  // 지정된 간격으로 runMatchmaking 함수를 반복 실행합니다.
  setInterval(runMatchmaking, MATCHMAKING_INTERVAL);
}

module.exports = {
  startMatchmakingService,
};