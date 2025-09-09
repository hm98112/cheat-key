/**
 * @file rating.js
 * @brief ELO 레이팅 점수 계산을 담당하는 서비스 모듈
 * @details 이 파일은 외부 상태에 의존하지 않고, 오직 입력값만으로
 * ELO 점수 변동을 계산하여 반환하는 순수 함수(pure function)를 내보냅니다.
 */

/**
 * ELO 점수 계산 함수
 * @param {number} winnerRating - 승자의 기존 ELO 점수
 * @param {number} loserRating - 패자의 기존 ELO 점수
 * @param {number} [k=32] - K-factor. 점수 변동폭에 영향을 주는 계수 (기본값 32)
 * @returns {{winnerNew: number, loserNew: number}} - 승자와 패자의 새로운 ELO 점수가 담긴 객체
 */
function calculateElo(winnerRating, loserRating, k = 32) {
  // --- 1. 기대 승률(Expected Score) 계산 ---
  // 두 플레이어의 점수 차이를 기반으로 각 플레이어의 승리 확률을 0과 1 사이의 값으로 계산합니다.
  // 400은 ELO 시스템에서 사용하는 상수로, 점수 차이가 400점 나면 상위 플레이어의 기대 승률이
  // 하위 플레이어의 10배가 되도록 설계된 값입니다.
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  // --- 2. 새로운 ELO 점수 계산 ---
  // 공식: 새 점수 = 기존 점수 + K * (실제 결과 - 기대 승률)
  // 승자의 실제 결과(Actual Score)는 1, 패자는 0으로 간주하여 계산합니다.
  const winnerNew = Math.round(winnerRating + k * (1 - expectedWinner));
  const loserNew = Math.round(loserRating + k * (0 - expectedLoser));

  // 계산된 승자와 패자의 새로운 점수를 객체 형태로 반환합니다.
  return { winnerNew, loserNew };
}

// calculateElo 함수를 모듈로 내보내 다른 파일(예: gameresult.js)에서 재사용할 수 있도록 합니다.
module.exports = calculateElo;
