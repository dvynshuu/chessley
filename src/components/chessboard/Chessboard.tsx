import React, { useState, useMemo, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { PieceSvg } from './PieceSvg';
import { BoardArrows } from './BoardArrows';
import { SquareBadge } from './SquareBadge';
import { PieceColor, MoveClassification } from '../../chess/types';
import { BoardTheme } from '../../state/settingsStore';
import { SoundEngine } from '../../utils/sound';

interface ChessboardProps {
  fen: string;
  orientation: PieceColor;
  theme: BoardTheme;
  lastMove?: { from: string; to: string } | null;
  bestMove?: string | null; // e.g. "e2e4"
  playedClassification?: MoveClassification | null;
  showArrows?: boolean;
  soundEnabled?: boolean;
  soundVolume?: number;
  onMove?: (from: string, to: string, promotion?: string) => void;
}

const THEME_COLORS: Record<BoardTheme, { light: string; dark: string; border: string }> = {
  tournament: {
    light: '#eceed2',
    dark: '#739552',
    border: '#4e6d33',
  },
  dark: {
    light: '#2d3748',
    dark: '#1a202c',
    border: '#111827',
  },
  glass: {
    light: '#334155',
    dark: '#0f172a',
    border: '#090d16',
  },
  wood: {
    light: '#f0d9b5',
    dark: '#b58863',
    border: '#8b5a2b',
  },
};

export const Chessboard: React.FC<ChessboardProps> = ({
  fen,
  orientation,
  theme,
  lastMove,
  bestMove,
  playedClassification,
  showArrows = true,
  soundEnabled = true,
  soundVolume = 0.6,
  onMove,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);

  // Parse FEN piece layout
  const { boardLayout, sideToMove, inCheck, checkKingSquare } = useMemo(() => {
    try {
      const chess = new Chess(fen);
      const board = chess.board();
      const stm = chess.turn() as PieceColor;
      const isCheck = chess.inCheck();

      let kingSquare: string | null = null;
      if (isCheck) {
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === 'k' && p.color === stm) {
              const file = String.fromCharCode('a'.charCodeAt(0) + c);
              const rank = 8 - r;
              kingSquare = `${file}${rank}`;
            }
          }
        }
      }

      return {
        boardLayout: board,
        sideToMove: stm,
        inCheck: isCheck,
        checkKingSquare: kingSquare,
      };
    } catch {
      return { boardLayout: [], sideToMove: 'w' as PieceColor, inCheck: false, checkKingSquare: null };
    }
  }, [fen]);

  // Compute legal moves from selected square
  const legalDestinations = useMemo(() => {
    if (!selectedSquare) return new Set<string>();
    try {
      const chess = new Chess(fen);
      const moves = chess.moves({ square: selectedSquare as Square, verbose: true });
      return new Set(moves.map((m) => m.to));
    } catch {
      return new Set<string>();
    }
  }, [fen, selectedSquare]);

  // Reset selected square when FEN changes
  useEffect(() => {
    setSelectedSquare(null);
  }, [fen]);

  const handleSquareClick = (square: string) => {
    if (promotionPending) return;

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      if (legalDestinations.has(square)) {
        // Check for pawn promotion
        const fromPiece = getPieceAt(selectedSquare);
        const isPromotion =
          fromPiece?.type === 'p' &&
          ((fromPiece.color === 'w' && square[1] === '8') || (fromPiece.color === 'b' && square[1] === '1'));

        if (isPromotion) {
          setPromotionPending({ from: selectedSquare, to: square });
          return;
        }

        // Execute standard move
        executeMove(selectedSquare, square);
        setSelectedSquare(null);
        return;
      }
    }

    // Select piece
    const piece = getPieceAt(square);
    if (piece && piece.color === sideToMove) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  const executeMove = (from: string, to: string, promotion = 'q') => {
    if (soundEnabled) {
      const targetPiece = getPieceAt(to);
      if (targetPiece) {
        SoundEngine.playCapture(soundVolume);
      } else {
        SoundEngine.playMove(soundVolume);
      }
    }
    onMove?.(from, to, promotion);
  };

  const getPieceAt = (sq: string) => {
    if (sq.length < 2) return null;
    const col = sq.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(sq[1], 10);
    if (boardLayout[row] && boardLayout[row][col]) {
      return boardLayout[row][col];
    }
    return null;
  };

  // Prepare arrows
  const arrows = useMemo(() => {
    if (!showArrows) return [];
    const list: Array<{ from: string; to: string; color: string; opacity?: number; width?: number }> = [];

    // Engine best move (emerald glow)
    if (bestMove && bestMove.length >= 4) {
      const from = bestMove.substring(0, 2);
      const to = bestMove.substring(2, 4);
      list.push({ from, to, color: '#10b981', opacity: 0.9, width: 3.2 });
    }

    // If played move was a blunder or mistake, show red/orange arrow
    if (
      lastMove &&
      (playedClassification === 'blunder' ||
        playedClassification === 'mistake' ||
        playedClassification === 'missed_win')
    ) {
      const color = playedClassification === 'blunder' ? '#ef4444' : '#f97316';
      // Only show played move arrow if different from best move
      if (bestMove && (lastMove.from !== bestMove.slice(0, 2) || lastMove.to !== bestMove.slice(2, 4))) {
        list.push({ from: lastMove.from, to: lastMove.to, color, opacity: 0.75, width: 2.8 });
      }
    }

    return list;
  }, [showArrows, bestMove, lastMove, playedClassification]);

  // Files and ranks order based on orientation
  const files = orientation === 'w' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
  const ranks = orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];

  const currentTheme = THEME_COLORS[theme];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '640px',
        aspectRatio: '1 / 1',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          width: '100%',
          height: '100%',
        }}
      >
        {ranks.map((rank, rankIdx) =>
          files.map((file, fileIdx) => {
            const square = `${file}${rank}`;
            const isLight = (rankIdx + fileIdx) % 2 === 0;
            const piece = getPieceAt(square);

            const isSelected = selectedSquare === square;
            const isLastMoveFrom = lastMove?.from === square;
            const isLastMoveTo = lastMove?.to === square;
            const isDestination = legalDestinations.has(square);
            const isCheckSquare = inCheck && checkKingSquare === square;
            const hasBadge = isLastMoveTo && playedClassification;

            // Background square color
            let bg = isLight ? currentTheme.light : currentTheme.dark;
            if (isLastMoveFrom || isLastMoveTo) {
              bg = isLight ? '#cdd26a' : '#aaa23a';
            }
            if (isSelected) {
              bg = isLight ? '#f7ec7d' : '#bbad30';
            }

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                style={{
                  position: 'relative',
                  backgroundColor: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: piece && piece.color === sideToMove ? 'pointer' : isDestination ? 'pointer' : 'default',
                  transition: 'background-color 0.15s ease',
                  overflow: 'hidden',
                }}
              >
                {/* Coordinates */}
                {fileIdx === 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: '3px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isLight ? currentTheme.dark : currentTheme.light,
                      opacity: 0.75,
                      pointerEvents: 'none',
                    }}
                  >
                    {rank}
                  </span>
                )}
                {rankIdx === 7 && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '1px',
                      right: '3px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isLight ? currentTheme.dark : currentTheme.light,
                      opacity: 0.75,
                      pointerEvents: 'none',
                    }}
                  >
                    {file}
                  </span>
                )}

                {/* Check danger glow */}
                {isCheckSquare && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, rgba(239, 68, 68, 0) 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Legal destination indicator */}
                {isDestination && !piece && (
                  <div
                    style={{
                      width: '32%',
                      height: '32%',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                {isDestination && piece && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '4px',
                      borderRadius: '50%',
                      border: '4px solid rgba(0, 0, 0, 0.25)',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Piece SVG */}
                {piece && (
                  <PieceSvg
                    piece={piece.type}
                    color={piece.color as PieceColor}
                    className="chessboard-piece"
                  />
                )}

                {/* Classification badge on played move destination */}
                {hasBadge && <SquareBadge classification={playedClassification} />}
              </div>
            );
          })
        )}
      </div>

      {/* SVG Arrows Layer */}
      <BoardArrows arrows={arrows} orientation={orientation} />

      {/* Promotion Choice Modal */}
      {promotionPending && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            {['q', 'r', 'b', 'n'].map((promoPiece) => (
              <button
                key={promoPiece}
                onClick={() => {
                  executeMove(promotionPending.from, promotionPending.to, promoPiece);
                  setPromotionPending(null);
                }}
                style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#334155',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.1s, background-color 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
              >
                <div style={{ width: '42px', height: '42px' }}>
                  <PieceSvg piece={promoPiece} color={sideToMove} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
