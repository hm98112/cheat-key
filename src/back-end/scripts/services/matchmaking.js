const db = require('../config/db'); // 데이터베이스 연결
const redisClient = require('../config/redis');
const { sendMessageToUser } = require('./socketManager');

const MATCHMAKING_INTERVAL = 5000;
const ELO_RANGE = 50;

async function createNewGame(gameTypeId) {
  const query = `
    INSERT INTO games (status, game_type_id) VALUES ('in_progress', $1) RETURNING game_id;
  `;
  const { rows } = await db.query(query, [gameTypeId]);
  return rows[0].game_id;
}


async function processMatch(player1, player2, gameTypeId) {
  const player1Id = player1.value;
  const player2Id = player2.value;

  try {
    // 1. DB에 새로운 게임 생성 및 gameId 확보
    const gameId = await createNewGame(gameTypeId );
    console.log(`[Matchmaking] New game created. ID: ${gameId}`);

    // 2. game_participants 테이블에 두 사용자 정보 저장
    await db.query(
      'INSERT INTO game_participants (game_id, user_id, initial_elo) VALUES ($1, $2, $3), ($1, $4, $5)',
      [gameId, player1Id, player1.score, player2Id, player2.score]
    );
    console.log(`[Matchmaking] Participants for game ${gameId} saved to DB.`);

    // 3. DB 저장이 완료된 후, 각 플레이어에게 매칭 성공 알림 전송
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

    console.log(`[Matchmaking] Notification sent for game ${gameId}.`);

  } catch (error) {
    console.error(`[Matchmaking] Error processing match between ${player1Id} and ${player2Id}:`, error);
    // TODO: 매치 처리 실패 시, 사용자들을 다시 대기열에 넣는 로직 추가 고려
  }
}

/**
 * 매칭 로직을 주기적으로 실행하는 함수
 */
async function runMatchmaking() {
  console.log('[Matchmaking] Running matchmaking cycle...');

  try {
    const gameTypeId = 1; // 현재는 Tetris(ID: 1)만 처리
    const queueKey = `matchmaking_queue:game_type:${gameTypeId}`;

    // 1. 대기열에 있는 모든 사용자를 가져옵니다 (ELO 점수 순으로 정렬됨).
    const players = await redisClient.zRangeWithScores(queueKey, 0, -1);

    if (players.length < 2) {
      console.log('[Matchmaking] Not enough players to match. Waiting...');
      return;
    }

    const matchedPairs = [];

    // 2. 플레이어 목록을 순회하며 매칭을 시도합니다.
    while (players.length >= 2) {
      const player1 = players.shift();
      let matchedIndex = -1;

      // 3. player1과 ELO 점수가 비슷한 상대를 찾습니다.
      for (let i = 0; i < players.length; i++) {
        const player2 = players[i];
        if (Math.abs(player1.score - player2.score) <= ELO_RANGE) {
          matchedIndex = i;
          break;
        }
      }

      if (matchedIndex !== -1) {
        // 3. 매칭 성공!
        const player2 = players.splice(matchedIndex, 1)[0];
        matchedPairs.push({ player1, player2 });

        console.log(`[Matchmaking] Match FOUND! Player ${player1.value} (ELO: ${player1.score}) vs Player ${player2.value} (ELO: ${player2.score})`);
      }
    }

    // 4. 매칭된 쌍들을 처리합니다. (DB 저장 및 알림)
    if (matchedPairs.length > 0) {
        const playersToRemove = [];
        const matchPromises = matchedPairs.map(pair => {
            playersToRemove.push(pair.player1.value, pair.player2.value);
            return processMatch(pair.player1, pair.player2, gameTypeId);
        });

        // 5. Redis 대기열에서 매칭된 모든 유저를 한 번에 제거합니다.
        await redisClient.zRem(queueKey, playersToRemove);
        
        // 6. 모든 매칭 처리가 완료될 때까지 기다립니다.
        await Promise.all(matchPromises);
    }

  } catch (error) {
    console.error('[Matchmaking] Error during matchmaking cycle:', error);
  }
}

/**
 * 매치메이킹 서비스를 시작합니다.
 */
function startMatchmaking() {
  console.log('✅ Matchmaking service started.');
  setInterval(runMatchmaking, MATCHMAKING_INTERVAL);
}

module.exports = {
  startMatchmaking,
};

