import { describe, it, expect } from 'vitest';
import {
  normalizeToWhitePerspective,
  toPlayerPerspective,
  compareScores,
  formatScore,
  evaluationToWinProbability,
  scoreLossToAccuracy,
  getEvaluationBarPercentage,
} from '../src/chess/EvaluationUtils';

describe('EvaluationUtils', () => {
  it('correctly normalizes score to White perspective', () => {
    // When White is to move, +150 cp means White is +1.50
    expect(normalizeToWhitePerspective({ type: 'cp', value: 150 }, 'w')).toEqual({ type: 'cp', value: 150 });
    // When Black is to move, +150 cp means Black is ahead, so White is -1.50
    expect(normalizeToWhitePerspective({ type: 'cp', value: 150 }, 'b')).toEqual({ type: 'cp', value: -150 });
    // When Black is to move, mate in 2 means Black mates in 2, so White is -M2
    expect(normalizeToWhitePerspective({ type: 'mate', value: 2 }, 'b')).toEqual({ type: 'mate', value: -2 });
  });

  it('converts to player perspective', () => {
    const whiteScore = { type: 'cp' as const, value: 200 };
    expect(toPlayerPerspective(whiteScore, 'w')).toEqual({ type: 'cp', value: 200 });
    expect(toPlayerPerspective(whiteScore, 'b')).toEqual({ type: 'cp', value: -200 });
  });

  it('correctly compares scores and mate distances', () => {
    const mate1 = { type: 'mate' as const, value: 1 };
    const mate3 = { type: 'mate' as const, value: 3 };
    const plus500 = { type: 'cp' as const, value: 500 };
    const zero = { type: 'cp' as const, value: 0 };
    const minus500 = { type: 'cp' as const, value: -500 };
    const minusMate2 = { type: 'mate' as const, value: -2 };
    const minusMate1 = { type: 'mate' as const, value: -1 };

    // Mate in 1 is better than mate in 3
    expect(compareScores(mate1, mate3)).toBeGreaterThan(0);
    // Mate in 3 is better than +500cp
    expect(compareScores(mate3, plus500)).toBeGreaterThan(0);
    // +500 is better than 0
    expect(compareScores(plus500, zero)).toBeGreaterThan(0);
    // 0 is better than -500
    expect(compareScores(zero, minus500)).toBeGreaterThan(0);
    // -500 is better than getting mated in 2
    expect(compareScores(minus500, minusMate2)).toBeGreaterThan(0);
    // Getting mated in 2 is better than getting mated in 1
    expect(compareScores(minusMate2, minusMate1)).toBeGreaterThan(0);
  });

  it('formats scores accurately', () => {
    expect(formatScore({ type: 'cp', value: 140 })).toBe('+1.4');
    expect(formatScore({ type: 'cp', value: -80 })).toBe('-0.8');
    expect(formatScore({ type: 'cp', value: 0 })).toBe('0.0');
    expect(formatScore({ type: 'mate', value: 4 })).toBe('M4');
    expect(formatScore({ type: 'mate', value: -2 })).toBe('-M2');
  });

  it('calculates mathematically sound win probabilities', () => {
    // 0 cp must be exactly 50% win probability
    const wpZero = evaluationToWinProbability({ type: 'cp', value: 0 }, 'w');
    expect(Math.round(wpZero)).toBe(50);

    // Advantage for White: positive centipawns should yield > 50%
    const wpAdvantage = evaluationToWinProbability({ type: 'cp', value: 250 }, 'w');
    expect(wpAdvantage).toBeGreaterThan(65);
    expect(wpAdvantage).toBeLessThan(85);

    // Advantage for Black: negative centipawns should yield < 50% for White
    const wpBlackAdv = evaluationToWinProbability({ type: 'cp', value: -250 }, 'w');
    expect(wpBlackAdv).toBeLessThan(35);

    // Mates should be near 100% or 0%
    const wpMateWin = evaluationToWinProbability({ type: 'mate', value: 3 }, 'w');
    expect(wpMateWin).toBeGreaterThan(99);
    const wpMateLoss = evaluationToWinProbability({ type: 'mate', value: -2 }, 'w');
    expect(wpMateLoss).toBeLessThan(1);
  });

  it('calculates move accuracy with appropriate decay', () => {
    // 0 loss must be 100% accuracy
    expect(scoreLossToAccuracy(50, 50).accuracy).toBe(100);

    // Minor loss (2%) should still yield high accuracy (> 90%)
    const minorLoss = scoreLossToAccuracy(50, 48);
    expect(minorLoss.accuracy).toBeGreaterThan(90);

    // Medium loss (10%) should yield around 60-70% accuracy
    const mediumLoss = scoreLossToAccuracy(50, 40);
    expect(mediumLoss.accuracy).toBeGreaterThan(55);
    expect(mediumLoss.accuracy).toBeLessThan(75);

    // Blunder loss (40%) should drop accuracy significantly (< 20%)
    const blunderLoss = scoreLossToAccuracy(70, 30);
    expect(blunderLoss.accuracy).toBeLessThan(25);
  });

  it('clamps evaluation bar percentage cleanly', () => {
    expect(getEvaluationBarPercentage({ type: 'cp', value: 0 })).toBeCloseTo(50, 0);
    expect(getEvaluationBarPercentage({ type: 'mate', value: 1 })).toBe(98);
    expect(getEvaluationBarPercentage({ type: 'mate', value: -1 })).toBe(2);
  });
});
