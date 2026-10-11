import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { evaluationToWinProbability } from '../src/chess/EvaluationUtils';
import { classifyMove } from '../src/chess/Classification';

describe('Golden Tactical & Chess Tests', () => {
  it('correctly detects checkmate in Scholar\'s Mate', () => {
    const chess = new Chess('r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4');
    expect(chess.isCheckmate()).toBe(true);
    expect(chess.isGameOver()).toBe(true);
  });

  it('correctly detects stalemate', () => {
    const chess = new Chess('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
    expect(chess.isStalemate()).toBe(true);
    expect(chess.isDraw()).toBe(true);
    expect(chess.isCheckmate()).toBe(false);
  });

  it('correctly detects en passant legality', () => {
    const chess = new Chess('rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3');
    const legalMoves = chess.moves({ verbose: true });
    const epMove = legalMoves.find((m) => m.flags.includes('e'));
    expect(epMove).toBeDefined();
    expect(epMove?.from).toBe('e5');
    expect(epMove?.to).toBe('f6');
  });

  it('correctly identifies brilliant sacrifice vs blunder', () => {
    // Dummy move sacrificing queen on e7
    const dummyMove = {
      ply: 24,
      moveNumber: 12,
      color: 'w' as const,
      san: 'Qxd7+',
      uci: 'd1d7',
      from: 'd1',
      to: 'd7',
      piece: 'q',
      captured: 'n',
      fenBefore: 'r1bqkb1r/ppppnppp/8/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5',
      fenAfter: 'r1bqkb1r/pppQnppp/8/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 5',
    };

    // If White played the engine best move and gained/preserved massive win probability
    const classification = classifyMove(
      dummyMove,
      'd1d7',
      'd1d7',
      80,
      95,
      0
    );
    expect(['best', 'brilliant']).toContain(classification);

    // If White instead blundered away the game
    const blunderClass = classifyMove(
      dummyMove,
      'a2a3',
      'd1d7',
      80,
      35,
      45
    );
    expect(['blunder', 'missed_win']).toContain(blunderClass);
  });

  it('verifies mathematical consistency across full score range', () => {
    for (let cp = -1500; cp <= 1500; cp += 100) {
      const wp = evaluationToWinProbability({ type: 'cp', value: cp }, 'w');
      expect(wp).toBeGreaterThanOrEqual(0);
      expect(wp).toBeLessThanOrEqual(100);

      // Monotonicity test: higher centipawns for White must yield higher or equal win probability
      if (cp > -1500) {
        const prevWp = evaluationToWinProbability({ type: 'cp', value: cp - 100 }, 'w');
        expect(wp).toBeGreaterThanOrEqual(prevWp);
      }
    }
  });

  it('evaluates checkmating move with 100% accuracy and never as a blunder', async () => {
    // Scholar's Mate: 4. Qxf7#
    const checkmateGame = {
      id: 'scholars_mate',
      white: { name: 'White' },
      black: { name: 'Black' },
      result: '1-0' as const,
      pgn: '',
      moves: [
        {
          ply: 1,
          moveNumber: 1,
          color: 'w' as const,
          san: 'Qxf7#',
          uci: 'f3f7',
          from: 'f3',
          to: 'f7',
          piece: 'q',
          captured: 'p',
          fenBefore: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
          fenAfter: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4',
        },
      ],
      source: 'manual' as const,
      metadata: {},
    };

    // Before Qxf7#: White has M1
    const evalBefore = {
      fen: checkmateGame.moves[0].fenBefore,
      sideToMove: 'w' as const,
      bestMove: 'f3f7',
      score: { type: 'mate' as const, value: 1 },
      normalizedScore: { type: 'mate' as const, value: 1 },
      depth: 18,
      principalVariation: ['f3f7'],
      multiPvLines: [],
    };

    // After Qxf7#: Checkmate on board (normalized to White win M0)
    const evalAfter = {
      fen: checkmateGame.moves[0].fenAfter,
      sideToMove: 'b' as const,
      bestMove: '',
      score: { type: 'mate' as const, value: -0 },
      normalizedScore: { type: 'mate' as const, value: 0 },
      depth: 99,
      principalVariation: [],
      multiPvLines: [],
    };

    const { GameAnalyzer } = await import('../src/analysis/GameAnalyzer');
    const analysis = GameAnalyzer.evaluateMove(checkmateGame, 1, evalBefore, evalAfter);

    expect(analysis.moveAccuracy).toBe(100);
    expect(analysis.winProbabilityLoss).toBe(0);
    expect(analysis.classification).not.toBe('blunder');
    expect(analysis.classification).not.toBe('missed_win');
    expect(['best', 'brilliant']).toContain(analysis.classification);
  });

  it('verifies AnalysisCache depth subsumption', async () => {
    const { AnalysisCache } = await import('../src/analysis/AnalysisCache');
    const cache = AnalysisCache.getInstance();
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    const highDepthResult = {
      fen,
      sideToMove: 'w' as const,
      bestMove: 'e2e4',
      score: { type: 'cp' as const, value: 25 },
      normalizedScore: { type: 'cp' as const, value: 25 },
      depth: 24,
      principalVariation: ['e2e4', 'e7e5'],
      multiPvLines: [{ depth: 24, multipv: 1, score: { type: 'cp' as const, value: 25 }, pv: ['e2e4'] }],
    };

    await cache.set(fen, 24, highDepthResult);

    // Querying with minDepth = 16 must hit the cached depth 24 result
    const retrieved = await cache.get(fen, 16);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.depth).toBe(24);
  });
});
