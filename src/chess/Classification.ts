import { Chess } from 'chess.js';
import { ChessMove, MoveClassification, PieceColor } from './types';

export interface ClassificationConfig {
  inaccuracyThreshold: number; // Win prob loss > 5%
  mistakeThreshold: number; // Win prob loss > 12%
  blunderThreshold: number; // Win prob loss > 22%
  excellentThreshold: number; // Win prob loss <= 2.5%
  goodThreshold: number; // Win prob loss <= 5.0%
}

export const DEFAULT_CLASSIFICATION_CONFIG: ClassificationConfig = {
  inaccuracyThreshold: 5.0,
  mistakeThreshold: 12.0,
  blunderThreshold: 22.0,
  excellentThreshold: 2.5,
  goodThreshold: 5.0,
};

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

/**
 * Checks if a move represents a genuine material sacrifice.
 */
export function isMaterialSacrifice(
  move: ChessMove,
  _fenBefore?: string
): boolean {
  if (move.ply <= 4) return false;
  const movingPiece = move.piece.toLowerCase();
  if (movingPiece === 'k') return false; // King moves are not sacrifices

  try {
    const movingPieceVal = PIECE_VALUES[movingPiece] || 0;
    const capturedPieceVal = move.captured ? (PIECE_VALUES[move.captured.toLowerCase()] || 0) : 0;

    const chessAfter = new Chess(move.fenAfter);
    const opponentColor: PieceColor = move.color === 'w' ? 'b' : 'w';

    // Check if the destination square is attacked by opponent in the resulting position
    const isAttackedByOpponent = chessAfter.isAttacked(move.to as any, opponentColor);
    const isDefendedByPlayer = chessAfter.isAttacked(move.to as any, move.color);

    // 1. Move into an undefended square attacked by opponent with net material down
    if (isAttackedByOpponent && !isDefendedByPlayer && movingPieceVal > capturedPieceVal) {
      return true;
    }

    // 2. Move into a defended square, but opponent can capture with a lower-value piece
    if (isAttackedByOpponent && isDefendedByPlayer) {
      const oppLegalMoves = chessAfter.moves({ verbose: true });
      const captureOfMovedPiece = oppLegalMoves.find((m) => m.to === move.to && m.captured);
      if (captureOfMovedPiece) {
        const capturingPieceVal = PIECE_VALUES[captureOfMovedPiece.piece.toLowerCase()] || 0;
        if (capturingPieceVal < movingPieceVal) {
          return true; // e.g. Queen or Rook attacked by pawn/minor piece
        }
      }
    }

    // 3. Sacrificed a different major piece (e.g. quiet move leaving Queen or Rook hanging)
    const oppMoves = chessAfter.moves({ verbose: true });
    for (const om of oppMoves) {
      if (om.captured && (om.captured === 'q' || om.captured === 'r')) {
        const targetSq = om.to;
        if (!chessAfter.isAttacked(targetSq as any, move.color)) {
          return true; // Heavy piece left completely hanging
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Classifies a move based on win probability loss, position context, and engine recommendation.
 */
export function classifyMove(
  move: ChessMove,
  playedUci: string,
  bestUci: string,
  winProbBefore: number,
  winProbAfter: number,
  winProbLoss: number,
  config: ClassificationConfig = DEFAULT_CLASSIFICATION_CONFIG,
  pvGapCp?: number,
  isBookMove?: boolean
): MoveClassification {
  const isExactBest = playedUci.toLowerCase() === bestUci.toLowerCase();
  const isBestMove = isExactBest || winProbLoss <= 0.2;

  // 1. Explicit Opening Book move
  if (isBookMove) {
    return 'book';
  }

  // 2. Brilliant move check:
  // Must be top engine move, must maintain a strong position (>= 50%),
  // and involves a genuine piece sacrifice
  if (isBestMove && winProbAfter >= 50 && winProbLoss <= 0.5 && move.ply > 4) {
    if (isMaterialSacrifice(move, move.fenBefore)) {
      return 'brilliant';
    }
  }

  // 3. Great move check:
  // The only winning/saving move in a difficult position (tactical singularity)
  if (
    isBestMove &&
    ((pvGapCp !== undefined && pvGapCp >= 150) ||
      (winProbBefore <= 45 && winProbAfter >= 52 && winProbLoss <= 0.2 && move.ply > 6))
  ) {
    return 'great';
  }

  // 4. Missed win / Missed Opportunity:
  // Player had a decisive advantage (>= 70% win probability),
  // but dropped it by >= 20% or down to <= 55%
  if (winProbBefore >= 70 && (winProbLoss >= 20 || winProbAfter <= 55)) {
    return 'missed_win';
  }

  // 5. Best move
  if (isBestMove) {
    return 'best';
  }

  // 6. Excellent move
  if (winProbLoss <= config.excellentThreshold) {
    return 'excellent';
  }

  // 7. Good move
  if (winProbLoss <= config.goodThreshold) {
    return 'good';
  }

  // 8. Inaccuracy
  if (winProbLoss <= config.mistakeThreshold) {
    return 'inaccuracy';
  }

  // 9. Mistake
  if (winProbLoss <= config.blunderThreshold) {
    return 'mistake';
  }

  // 10. Blunder
  return 'blunder';
}

export interface ClassificationBadgeInfo {
  symbol: string;
  name: string;
  color: string;
  bgColor: string;
  description: string;
}

export const CLASSIFICATION_META: Record<MoveClassification, ClassificationBadgeInfo> = {
  brilliant: {
    symbol: '!!',
    name: 'Brilliant',
    color: '#00e5ff',
    bgColor: 'rgba(0, 229, 255, 0.15)',
    description: 'A spectacular move that sacrifices material to find the best continuation.',
  },
  great: {
    symbol: '!',
    name: 'Great',
    color: '#5c6bc0',
    bgColor: 'rgba(92, 107, 192, 0.15)',
    description: 'The only good move in a difficult position.',
  },
  best: {
    symbol: '★',
    name: 'Best',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    description: 'The engine top recommendation.',
  },
  excellent: {
    symbol: '✓',
    name: 'Excellent',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.15)',
    description: 'An excellent alternative move.',
  },
  good: {
    symbol: '✓',
    name: 'Good',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.15)',
    description: 'A solid move preserving the evaluation.',
  },
  inaccuracy: {
    symbol: '?!',
    name: 'Inaccuracy',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    description: 'A minor error that concedes some advantage.',
  },
  mistake: {
    symbol: '?',
    name: 'Mistake',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    description: 'A noticeable mistake that worsens the position.',
  },
  blunder: {
    symbol: '??',
    name: 'Blunder',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    description: 'A serious error that throws away significant advantage.',
  },
  missed_win: {
    symbol: '✕',
    name: 'Missed Win',
    color: '#e11d48',
    bgColor: 'rgba(225, 29, 72, 0.15)',
    description: 'Missed a clear tactical win or crushing advantage.',
  },
  book: {
    symbol: '📖',
    name: 'Book',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    description: 'Standard established opening theory.',
  },
};
