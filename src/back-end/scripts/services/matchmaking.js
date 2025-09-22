/**
 * @file matchmaking.js
 * @brief 주기적으로 매칭 대기열을 확인하고, 유효한 사용자 간의 매치를 성사시키는 서비스 모듈
 */

const db = require('../config/db');
const redisClient = require('../config/redis');
const { sendMessageToUser, clients } = require('./socketManager');

const MATCHMAKING_INTERVAL = 5000; // 5초마다 매칭 로직 실행
const ELO_RANGE = 150; // 매칭을 허용하는 최대 ELO 점수 차이

/**
 * 실제 매칭 로직을 처리하는 함수.
 * 주기적으로 Redis 대기열을 확인하여 매칭을 처리합니다.
 * '유령 매칭' 방지 및 'ELO 점수 차이' 규칙을 모두 적용합니다.
 * @param {number} gameTypeId - 매칭을 처리할 게임의 종류 ID
 */
async function findAndProcessMatches(gameTypeId) {
  const queueKey = `matchmaking_queue:game_type:${gameTypeId}`;
  const matchedPlayerIds = new Set(); // 이번 매칭 주기에서 이미 매칭된 플레이어들을 기록

  try {
    const players = await redisClient.zRangeWithScores(queueKey, 0, -1);
    if (players.length < 2) return;

    // 대기열의 모든 플레이어를 순회하며 최적의 파트너를 찾음
    for (let i = 0; i < players.length; i++) {
      const player1Data = players[i];
      // 이미 이번 주기에 매칭된 플레이어는 건너뜀
      if (matchedPlayerIds.has(player1Data.value)) continue;

      // player1을 위한 최적의 파트너를 찾음 (자기 다음 사람부터)
      for (let j = i + 1; j < players.length; j++) {
        const player2Data = players[j];
        if (matchedPlayerIds.has(player2Data.value)) continue;

        const player1 = { id: player1Data.value, elo: player1Data.score };
        const player2 = { id: player2Data.value, elo: player2Data.score };

        // --- START: ELO 점수 차이 확인 로직 ---
        if (Math.abs(player1.elo - player2.elo) < ELO_RANGE) {
          // [조건 충족] ELO 점수 차이가 150 미만인 상대를 찾았을 경우
          
          // --- START: 유령 매칭 방지 로직 (실시간 온라인 상태 확인) ---
          const isPlayer1Online = clients.has(player1.id.toString());
          const isPlayer2Online = clients.has(player2.id.toString());

          if (isPlayer1Online && isPlayer2Online) {
            // [최종 성공] 두 명 모두 온라인 상태 확인!
            console.log(`[Matchmaking] ✅ ELO(${Math.abs(player1.elo - player2.elo)}) 및 온라인 확인: ${player1.id} vs ${player2.id}. 매칭 진행.`);
            
            // 두 플레이어를 '매칭됨'으로 기록
            matchedPlayerIds.add(player1.id);
            matchedPlayerIds.add(player2.id);

            // DB에 게임 생성 및 matchSuccess 이벤트 전송 (예시 로직)
            const client = await db.connect();
            try {
                await client.query('BEGIN');
                const gameQuery = `INSERT INTO games (game_type_id, status) VALUES ($1, 'in_progress') RETURNING game_id;`;
                const gameResult = await client.query(gameQuery, [gameTypeId]);
                const gameId = gameResult.rows[0].game_id;
                const participantQuery = `INSERT INTO game_participants (game_id, user_id, initial_elo) VALUES ($1, $2, $3);`;
                await client.query(participantQuery, [gameId, player1.id, player1.elo]);
                await client.query(participantQuery, [gameId, player2.id, player2.elo]);
                await client.query('COMMIT');
                sendMessageToUser(player1.id, 'matchSuccess', { gameId });
                sendMessageToUser(player2.id, 'matchSuccess', { gameId });
            } catch (dbError) {
                await client.query('ROLLBACK');
                console.error('[Matchmaking] DB 작업 오류:', dbError);
                // DB 오류 시 매칭 실패로 간주하고, '매칭됨' 기록을 취소하여 다시 매칭될 수 있도록 함
                matchedPlayerIds.delete(player1.id);
                matchedPlayerIds.delete(player2.id);
            } finally {
                client.release();
            }
            // --- END: 유령 매칭 방지 로직 (실시간 온라인 상태 확인) ---
            
            // player1의 짝을 찾았으므로, 다음 플레이어로 넘어감
            break; 
          }
        } else {
          // [조건 불충족] ELO 점수 차이가 너무 큰 경우
          // 대기열은 ELO 순으로 정렬되어 있으므로, 이 이후의 모든 플레이어는 차이가 더 클 것임
          // 따라서 player1의 파트너 찾기를 중단하고 다음 플레이어로 넘어감
          break;
        }
        // --- END: ELO 점수 차이 확인 로직 ---
      }
    }

    // 이번 주기에 매칭된 모든 플레이어들을 한 번에 Redis 대기열에서 제거
    if (matchedPlayerIds.size > 0) {
      await redisClient.zRem(queueKey, Array.from(matchedPlayerIds));
      console.log(`[Matchmaking] ↪️ 매칭된 ${matchedPlayerIds.size}명의 사용자를 대기열에서 제거했습니다.`);
    }

  } catch (error) {
    console.error('매칭 처리 중 오류 발생:', error);
  }
}

/**
 * 매치메이킹 서비스를 시작하는 함수.
 * index.js에서 호출되어 주기적으로 매칭 로직을 실행시킵니다.
 */
function startMatchmaking() {
  console.log('🚀 매치메이킹 서비스를 시작합니다.');
  // 현재는 테트리스(ID: 1)만 가정하여 주기적으로 실행
  setInterval(() => findAndProcessMatches(1), MATCHMAKING_INTERVAL);
}

module.exports = { startMatchmaking };