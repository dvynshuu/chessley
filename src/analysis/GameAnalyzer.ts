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

    const playedUci = move.uci;
    const bestUci = evalBefore.bestMove;
    const isEngineBest = playedUci.toLowerCase() === bestUci.toLowerCase();

    // Win probability from the player's perspective
    const winProbBefore = evaluationToWinProbability(bestScoreBefore, playerColor);
    const winProbAfter = evaluationToWinProbability(playedScoreAfter, playerColor);

    let winProbLoss: number;
    let accuracy: number;

    if (isEngineBest) {
      // Top engine recommendation must never be penalized by depth horizon noise
      winProbLoss = 0;
      accuracy = 100;
    } else {
      const res = scoreLossToAccuracy(winProbBefore, winProbAfter);
      winProbLoss = res.winProbLoss;
      accuracy = res.accuracy;
    }

    // Measure tactical singularity gap between 1st and 2nd engine lines if multiPV available
    let pvGapCp: number | undefined;
    if (evalBefore.multiPvLines && evalBefore.multiPvLines.length >= 2) {
      const line1 = evalBefore.multiPvLines[0];
      const line2 = evalBefore.multiPvLines[1];
      if (line1 && line2 && line1.score.type === 'cp' && line2.score.type === 'cp') {
        pvGapCp = Math.abs(line1.score.value - line2.score.value);
      }
    }

    const isCheckmate = evalAfter.score.type === 'mate' && Math.abs(evalAfter.score.value) === 0;
    const hasOpeningInfo = Boolean(game.eco || game.opening || game.metadata?.['ECO'] || game.metadata?.['Opening']);
    const isBookCandidate = isEngineBest && !isCheckmate;
    const isBookMove = isBookCandidate && move.ply <= 12 && hasOpeningInfo;

    const classification = classifyMove(
      move,
      playedUci,
      bestUci,
      winProbBefore,
      winProbAfter,
      winProbLoss,
      undefined,
      pvGapCp,
      isBookMove
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

    const avg = (arr: number[], emptyVal = 100) =>
      arr.length === 0 ? emptyVal : Math.round((arr.reduce((s, x) => s + x, 0) / arr.length) * 10) / 10;

    return {
      whiteAccuracy: avg(accuraciesW, 100),
      blackAccuracy: avg(accuraciesB, 100),
      totalPlies: game.moves.length,
      classificationCounts: {
        w: countsW,
        b: countsB,
      },
      openingAccuracy: {
        w: avg(openingW, 0),
        b: avg(openingB, 0),
      },
      middlegameAccuracy: {
        w: avg(middleW, 0),
        b: avg(middleB, 0),
      },
      endgameAccuracy: {
        w: avg(endW, 0),
        b: avg(endB, 0),
      },
      criticalMoments,
    };
  }
}
