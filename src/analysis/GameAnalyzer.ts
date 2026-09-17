import { ChessGame, MoveAnalysis, GameSummary, MoveClassification } from '../chess/types';
import { EngineAnalysisResult } from '../engine/stockfish/EngineTypes';
import { evaluationToWinProbability, scoreLossToAccuracy } from '../chess/EvaluationUtils';
import { classifyMove } from '../chess/Classification';
import { Chess } from 'chess.js';

export class GameAnalyzer {
  /**
   * Evaluates a played move given the engine analysis of the position before and after.
   */
  public static evaluateMove(
    game: ChessGame,
    ply: number,
    evalBefore: EngineAnalysisResult,
    evalAfter: EngineAnalysisResult
  ): MoveAnalysis {
    const move = game.moves[ply - 1];
    const playerColor = move.color;

    // Both scores normalized to White perspective
    const bestScoreBefore = evalBefore.normalizedScore;
    const playedScoreAfter = evalAfter.normalizedScore;

    // Win probability from the player's perspective
    const winProbBefore = evaluationToWinProbability(bestScoreBefore, playerColor);
    const winProbAfter = evaluationToWinProbability(playedScoreAfter, playerColor);

    const { winProbLoss, accuracy } = scoreLossToAccuracy(winProbBefore, winProbAfter);

    const playedUci = move.uci;
    const bestUci = evalBefore.bestMove;

    const classification = classifyMove(
      move,
      playedUci,
      bestUci,
      winProbBefore,
      winProbAfter,
      winProbLoss
    );

    // Convert best UCI move to SAN for clean UI display
    let bestMoveSan = bestUci;
    try {
      const chess = new Chess(move.fenBefore);
      const from = bestUci.substring(0, 2);
      const to = bestUci.substring(2, 4);
      const promotion = bestUci.length > 4 ? bestUci[4] : undefined;
      const res = chess.move({ from: from as any, to: to as any, promotion: promotion as any });
      if (res) {
        bestMoveSan = res.san;
      }
    } catch {
      // Fallback to UCI
    }

    return {
      ply,
      moveNumber: move.moveNumber,
      color: playerColor,
      san: move.san,
      uci: playedUci,
      fenBefore: move.fenBefore,
      fenAfter: move.fenAfter,
      bestScoreBefore,
      playedScoreAfter,
      bestMove: bestUci,
      bestMoveSan,
      principalVariation: evalBefore.principalVariation,
      winProbabilityBefore: Math.round(winProbBefore * 10) / 10,
      winProbabilityAfter: Math.round(winProbAfter * 10) / 10,
      winProbabilityLoss: winProbLoss,
      moveAccuracy: accuracy,
      classification,
      depth: Math.max(evalBefore.depth, evalAfter.depth),
      nodes: (evalBefore.nodes || 0) + (evalAfter.nodes || 0),
      timeMs: (evalBefore.timeMs || 0) + (evalAfter.timeMs || 0),
      analyzedAt: Date.now(),
      engineVersion: 'Stockfish 19 Max',
    };
  }

  /**
   * Aggregates all move analyses into an overall GameSummary.
   */
  public static computeSummary(
    game: ChessGame,
    analyses: Record<number, MoveAnalysis>
  ): GameSummary {
    const countsW: Record<MoveClassification, number> = {
      brilliant: 0,
      great: 0,
      best: 0,
      excellent: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      missed_win: 0,
      book: 0,
    };

    const countsB: Record<MoveClassification, number> = {
      brilliant: 0,
      great: 0,
      best: 0,
      excellent: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      missed_win: 0,
      book: 0,
    };

    const accuraciesW: number[] = [];
    const accuraciesB: number[] = [];

    const openingW: number[] = [];
    const openingB: number[] = [];
    const middleW: number[] = [];
    const middleB: number[] = [];
    const endW: number[] = [];
    const endB: number[] = [];

    const criticalMoments: number[] = [];

    for (const move of game.moves) {
      const a = analyses[move.ply];
      if (!a) continue;

      const isWhite = move.color === 'w';
      if (isWhite) {
        countsW[a.classification] = (countsW[a.classification] || 0) + 1;
        accuraciesW.push(a.moveAccuracy);
      } else {
        countsB[a.classification] = (countsB[a.classification] || 0) + 1;
        accuraciesB.push(a.moveAccuracy);
      }

      // Phase categorisation:
      // Opening: plies 1-20 (moves 1-10)
      // Middlegame: plies 21-60 (moves 11-30)
      // Endgame: plies 61+
      if (move.ply <= 20) {
        (isWhite ? openingW : openingB).push(a.moveAccuracy);
      } else if (move.ply <= 60) {
        (isWhite ? middleW : middleB).push(a.moveAccuracy);
      } else {
        (isWhite ? endW : endB).push(a.moveAccuracy);
      }

      // Critical moment detection:
      // Blunder, mistake, missed win, or win probability loss >= 15%
      if (
        a.classification === 'blunder' ||
        a.classification === 'mistake' ||
        a.classification === 'missed_win' ||
        a.winProbabilityLoss >= 15
      ) {
        criticalMoments.push(move.ply);
      }
    }

    const avg = (arr: number[]) => (arr.length === 0 ? 100 : Math.round((arr.reduce((s, x) => s + x, 0) / arr.length) * 10) / 10);

    return {
      whiteAccuracy: avg(accuraciesW),
      blackAccuracy: avg(accuraciesB),
      totalPlies: game.moves.length,
      classificationCounts: {
        w: countsW,
        b: countsB,
      },
      openingAccuracy: {
        w: avg(openingW),
        b: avg(openingB),
      },
      middlegameAccuracy: {
        w: avg(middleW),
        b: avg(middleB),
      },
      endgameAccuracy: {
        w: avg(endW),
        b: avg(endB),
      },
      criticalMoments,
    };
  }
}
