/**
 * @file matchmaking.js
 * @brief 주기적으로 매칭을 시도하고, 성공 시 게임을 생성하며 유저에게 알림을 보내는 서비스
 * @details 이 서비스는 API 요청에 의해 실행되는 것이 아니라, 서버가 시작될 때 함께 실행되어
 * 백그라운드에서 계속 동작합니다. Redis 대기열을 주기적으로 확인하여 매칭을 처리합니다.
 */

// --- 모듈 임포트 ---
const db = require('../config/db');                       // PostgreSQL 데이터베이스 연결
const redisClient = require('../config/redis');           // Redis 클라이언트
const { sendMessageToUser } = require('./socketManager'); // WebSocket 메시지 전송 함수

// --- 상수 정의 ---
const MATCHMAKING_INTERVAL = 5000; // 매칭 로직을 실행할 주기 (ms 단위, 5초)
const ELO_RANGE = 150;              // 매칭을 허용할 최대 ELO 점수 차이

/**
 * DB에 새로운 게임 세션을 생성하고, 생성된 game_id를 반환합니다.
 * @param {number} gameTypeId - 생성할 게임의 종류 ID
 * @returns {Promise<number>} 생성된 게임의 game_id
 */
async function createNewGame(gameTypeId) {
  const query = `
    INSERT INTO games (status, game_type_id) VALUES ('in_progress', $1) RETURNING game_id;
  `;
  const { rows } = await db.query(query, [gameTypeId]);
  return rows[0].game_id;
}

/**
 * 매칭이 성사된 두 플레이어에 대한 후속 처리를 담당합니다.
 * (DB에 게임 생성, 참여자 정보 저장, 유저에게 알림 전송)
 * @param {{value: string, score: number}} player1 - 첫 번째 플레이어 정보 { userId, elo }
 * @param {{value: string, score: number}} player2 - 두 번째 플레이어 정보 { userId, elo }
 * @param {number} gameTypeId - 게임 종류 ID
 */
async function processMatch(player1, player2, gameTypeId) {
  const player1Id = player1.value;
  const player2Id = player2.value;

  try {
    // 1. DB에 'in_progress' 상태의 새로운 게임을 생성하고 game_id를 받아옵니다.
    const gameId = await createNewGame(gameTypeId );
    // 디버깅: console.log(`[Matchmaking] New game created. ID: ${gameId}`);

    // 2. 'game_participants' 테이블에 두 플레이어의 정보를 기록합니다.
    //    한 번의 쿼리로 두 명의 데이터를 동시에 INSERT하여 효율성을 높입니다.
    await db.query(
      'INSERT INTO game_participants (game_id, user_id, initial_elo) VALUES ($1, $2, $3), ($1, $4, $5)',
      [gameId, player1Id, player1.score, player2Id, player2.score]
    );
    // 디버깅: console.log(`[Matchmaking] Participants for game ${gameId} saved to DB.`);

    /// 3. 각 플레이어에게 WebSocket을 통해 매칭 성공 사실과 상대방 정보를 전송합니다.
    const payloadForP1 = {
      gameId,
      opponent: { userId: player2Id, elo: player2.score },
    };
    sendMessageToUser(player1Id, 'matchSuccess', payloadForP1);

    const payloadForP2 = {
      gameId,
      opponent: { userId: player1Id, elo: player1.score },
    };
    sendMessageToUser(player2Id, 'matchSuccess', payloadForP2);

    // 디버깅: console.log(`[Matchmaking] Notification sent for game ${gameId}.`);

  } catch (error) {
    // 디버깅: console.error(`[Matchmaking] Error processing match between ${player1Id} and ${player2Id}:`, error);
    // TODO: 매치 처리 중 오류 발생 시, 두 플레이어를 다시 대기열에 넣는 로직을 추가해야
    //       안정성을 높일 수 있습니다. (예: Redis에 재삽입)
  }
}

/**
 * Redis 대기열을 확인하여 매칭 로직을 실행하는 메인 함수.
 * MATCHMAKING_INTERVAL 마다 주기적으로 호출됩니다.
 */
async function runMatchmaking() {
  // 디버깅: console.log('[Matchmaking] Running matchmaking cycle...');

  try {
    // TODO: 현재는 Tetris(ID: 1)만 처리하도록 하드코딩되어 있습니다.
    // 향후 여러 게임 타입을 지원하려면, 모든 game_type_id에 대해 반복 처리하도록 수정해야 합니다.
    const gameTypeId = 1;
    const queueKey = `matchmaking_queue:game_type:${gameTypeId}`;

    // 1. Redis Sorted Set에서 대기 중인 모든 플레이어를 ELO 점수 순으로 가져옵니다.
    const players = await redisClient.zRangeWithScores(queueKey, 0, -1);

    // 매칭에 필요한 최소 인원(2명)이 없으면 즉시 종료합니다.
    if (players.length < 2) {
      console.log('[Matchmaking] Not enough players to match. Waiting...');
      return;
    }

    const matchedPairs = []; // 매칭된 플레이어 쌍을 저장할 배열
    const matchedPlayerIds = new Set(); // 이미 매칭된 플레이어 ID를 추적하여 중복 매칭을 방지

    // 2. 이중 for문을 사용해 모든 가능한 플레이어 조합을 확인하며 매칭을 시도합니다.
    for (let i = 0; i < players.length; i++) {
      const player1 = players[i];
      // player1이 이미 다른 쌍으로 매칭되었다면 건너뜁니다.
      if (matchedPlayerIds.has(player1.value)) continue;

      for (let j = i + 1; j < players.length; j++) {
        const player2 = players[j];
        // player2가 이미 매칭되었다면 건너뜁니다.
        if (matchedPlayerIds.has(player2.value)) continue;

        // 3. 두 플레이어의 ELO 점수 차이가 설정된 범위(ELO_RANGE) 이내인지 확인합니다.
        if (Math.abs(player1.score - player2.score) <= ELO_RANGE) {
          // 매칭 성공!
          matchedPairs.push({ player1, player2 });
          matchedPlayerIds.add(player1.value);
          matchedPlayerIds.add(player2.value);

          // 디버깅: console.log(`[Matchmaking] Match FOUND! Player ${player1.value} (ELO: ${player1.score}) vs Player ${player2.value} (ELO: ${player2.score})`);
          
          // player1의 짝을 찾았으므로, 더 이상 player1의 다른 짝을 찾을 필요가 없습니다.
          break;
        }
      }
    }

    // 4. 매칭된 쌍이 하나 이상 있는 경우, 후속 처리를 진행합니다.
    if (matchedPairs.length > 0) {
      // 5. Redis 대기열에서 매칭된 모든 유저를 한 번에 제거하기 위해 ID 목록을 준비합니다.
      const playersToRemove = Array.from(matchedPlayerIds);

      // 6. 각 매칭 쌍에 대해 processMatch 함수를 비동기적으로 실행합니다.
      const matchPromises = matchedPairs.map(pair =>
        processMatch(pair.player1, pair.player2, gameTypeId)
      );

      // 7. Redis에서 매칭된 유저들을 실제로 제거하고, 모든 매칭 처리가 완료될 때까지 기다립니다.
      await Promise.all([
        redisClient.zRem(queueKey, playersToRemove),
        ...matchPromises
      ]);
    }

  } catch (error) {
    // 디버깅: console.error('[Matchmaking] Error during matchmaking cycle:', error);
  }
}

/**
 * 매치메이킹 서비스를 시작하는 함수. 서버 시작 시 한 번만 호출됩니다.
 */
function startMatchmaking() {
  // 디버깅: console.log('✅ Matchmaking service started.');
  // 설정된 주기(MATCHMAKING_INTERVAL)마다 runMatchmaking 함수를 반복 실행합니다.
  setInterval(runMatchmaking, MATCHMAKING_INTERVAL);
}

// 매치메이킹 서비스를 시작하는 함수만 외부로 노출하여 인터페이스를 단순화합니다.
module.exports = {
  startMatchmaking,
};