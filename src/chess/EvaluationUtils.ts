import { EngineScore, PieceColor } from './types';

/**
 * Helper to determine if an EngineScore represents a negative value (including -0 for checkmate loss).
 */
export function isNegativeScore(score: EngineScore): boolean {
  return score.value < 0 || Object.is(score.value, -0);
}

/**
 * Normalizes an engine score from the side-to-move's perspective
 * into standard White's perspective (positive = White winning, negative = Black winning).
 */
export function normalizeToWhitePerspective(score: EngineScore, sideToMove: PieceColor): EngineScore {
  if (sideToMove === 'w') {
    return { ...score };
  }
  const isNegZero = Object.is(score.value, -0);
  const isPosZero = Object.is(score.value, 0);
  let newVal = -score.value;
  if (isPosZero) newVal = -0;
  else if (isNegZero) newVal = 0;

  return {
    type: score.type,
    value: newVal,
  };
}

/**
 * Converts a White-perspective score to a specific player's perspective.
 */
export function toPlayerPerspective(whiteScore: EngineScore, playerColor: PieceColor): EngineScore {
  if (playerColor === 'w') {
    return { ...whiteScore };
  }
  const isNegZero = Object.is(whiteScore.value, -0);
  const isPosZero = Object.is(whiteScore.value, 0);
  let newVal = -whiteScore.value;
  if (isPosZero) newVal = -0;
  else if (isNegZero) newVal = 0;

  return {
    type: whiteScore.type,
    value: newVal,
  };
}

/**
 * Converts an EngineScore to a scalar numeric value in centipawns for comparisons.
 * Mate scores are converted into high magnitude values.
 */
export function scoreToNumeric(score: EngineScore): number {
  if (score.type === 'cp') {
    return score.value;
  }
  // For mate: M1 is better than M2, -M1 is worse than -M2.
  // M0 is checkmate (+30000), -M0 is getting checkmated (-30000).
  const isNeg = isNegativeScore(score);
  const sign = isNeg ? -1 : 1;
  const distance = Math.abs(score.value);
  return sign * (30000 - Math.min(distance, 100) * 100);
}

/**
 * Compares two White-perspective scores.
 * Returns > 0 if a is better for White, < 0 if b is better for White, 0 if equal.
 */
export function compareScores(a: EngineScore, b: EngineScore): number {
  return scoreToNumeric(a) - scoreToNumeric(b);
}

/**
 * Formats a score for display.
 * @param score Engine score (already normalized or in player perspective)
 * @param perspective If specified, ensures score is displayed from this perspective
 */
export function formatScore(score: EngineScore, perspective: PieceColor = 'w'): string {
  const displayScore = perspective === 'w' ? score : toPlayerPerspective(score, 'b');

  if (displayScore.type === 'mate') {
    const isNeg = isNegativeScore(displayScore);
    const mateNum = Math.abs(displayScore.value);
    if (mateNum === 0) {
      return isNeg ? '-M0' : 'M0';
    }
    return isNeg ? `-M${mateNum}` : `M${mateNum}`;
  }

  const cp = displayScore.value / 100;
  if (Math.abs(cp) < 0.005) {
    return '0.0';
  }
  return (cp > 0 ? `+${cp.toFixed(1)}` : cp.toFixed(1));
}

/**
 * Converts a centipawn score to Win Probability (0 to 100) using the standard Lichess sigmoid model.
 * WP(cp) = 100 / (1 + exp(-0.00368208 * cp))
 *
 * @param whiteScore Score in White's perspective
 * @param player Perspective to calculate win probability for ('w' or 'b')
 */
export function evaluationToWinProbability(whiteScore: EngineScore, player: PieceColor = 'w'): number {
  const score = player === 'w' ? whiteScore : toPlayerPerspective(whiteScore, 'b');

  if (score.type === 'mate') {
    const isNeg = isNegativeScore(score);
    if (!isNeg) {
      // Winning mate: between 99.0% and 100% depending on distance
      return Math.max(99.0, 100 - Math.min(Math.abs(score.value) * 0.15, 1.0));
    } else {
      // Losing mate: between 0.0% and 1.0%
      return Math.min(1.0, Math.max(0.0, Math.abs(score.value) * 0.15));
    }
  }

  // Sigmoid formula
  const cp = score.value;
  const wp = 100 / (1 + Math.exp(-0.00368208 * cp));
  return Math.max(0, Math.min(100, wp));
}

/**
 * Calculates move accuracy (0% to 100%) from win probability loss.
 * Uses the mathematically validated CAPS exponential curve:
 * Accuracy = 103.1668 * exp(-0.04354 * loss) - 3.1668
 */
export function scoreLossToAccuracy(winProbBefore: number, winProbAfter: number): {
  winProbLoss: number;
  accuracy: number;
} {
  const winProbLoss = Math.max(0, winProbBefore - winProbAfter);
  if (winProbLoss <= 0.01) {
    return { winProbLoss: 0, accuracy: 100 };
  }

  const rawAccuracy = 103.1668 * Math.exp(-0.04354 * winProbLoss) - 3.1668;
  const accuracy = Math.round(Math.max(0, Math.min(100, rawAccuracy)) * 10) / 10;

  return {
    winProbLoss: Math.round(winProbLoss * 10) / 10,
    accuracy,
  };
}

/**
 * Calculates evaluation bar fill percentage for White (0% = Black winning, 50% = Equal, 100% = White winning).
 */
export function getEvaluationBarPercentage(whiteScore: EngineScore): number {
  if (whiteScore.type === 'mate') {
    const isNeg = isNegativeScore(whiteScore);
    return isNeg ? 2 : 98;
  }
  // Clamp between -1000cp and +1000cp with non-linear ease for visual clarity
  const cp = Math.max(-1000, Math.min(1000, whiteScore.value));
  // Sigmoid mapped to [5, 95] percent range so bar is always visible
  const sigmoid = 1 / (1 + Math.exp(-0.004 * cp));
  return 5 + sigmoid * 90;
}
