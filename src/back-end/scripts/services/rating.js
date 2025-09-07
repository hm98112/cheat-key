/**
 * ELO 점수 계산 함수
 * @param {number} winnerRating - 승자 기존 점수
 * @param {number} loserRating - 패자 기존 점수
 * @param {number} k - K값(기본 32)
 * @returns {{winnerNew: number, loserNew: number}}
 */
function calculateElo(winnerRating, loserRating, k = 32) {
  // 기대 승률 계산
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  // 실제 결과 반영 (승자: 1, 패자: 0)
  const winnerNew = Math.round(winnerRating + k * (1 - expectedWinner));
  const loserNew = Math.round(loserRating + k * (0 - expectedLoser));

  return { winnerNew, loserNew };
}

module.exports = calculateElo;
