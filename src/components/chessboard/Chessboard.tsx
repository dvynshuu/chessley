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
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const THEME_COLORS: Record<BoardTheme, { light: string; dark: string; border: string }> = {
  tournament: {
    light: '#ececd3',
    dark: '#739552',
    border: '#4e6d33',
  },
  dark: {
    light: '#334155',
    dark: '#1e293b',
    border: '#0f172a',
  },
  glass: {
    light: '#3b4c68',
    dark: '#111927',
    border: '#080d17',
  },
  wood: {
    light: '#f0d9b5',
    dark: '#b58863',
    border: '#8b5a2b',
  },
  midnight: {
    light: '#272d42',
    dark: '#121624',
    border: '#c8aa6e',
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
  onSwipeLeft,
  onSwipeRight,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string; color: PieceColor } | null>(null);
  const touchStartRef = React.useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    // Minimum distance 40px and predominantly horizontal (abs(dx) > abs(dy) * 1.3) within 500ms
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3 && dt < 500) {
      if (dx < 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }
  };

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

  // Reset selected square and pending promotion when FEN changes
  useEffect(() => {
    setSelectedSquare(null);
    setPromotionPending(null);
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

        if (isPromotion && fromPiece) {
          setPromotionPending({ from: selectedSquare, to: square, color: fromPiece.color });
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
    // Only draw recommendation arrow if it corresponds to a valid piece for the current side to move
    if (bestMove && bestMove.length >= 4) {
      const from = bestMove.substring(0, 2);
      const to = bestMove.substring(2, 4);
      const piece = getPieceAt(from);
      if (piece && piece.color === sideToMove) {
        list.push({ from, to, color: '#10b981', opacity: 0.9, width: 3.2 });
      }
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
      if (!bestMove || lastMove.from !== bestMove.slice(0, 2) || lastMove.to !== bestMove.slice(2, 4)) {
        list.push({ from: lastMove.from, to: lastMove.to, color, opacity: 0.75, width: 2.8 });
      }
    }

    return list;
  }, [showArrows, bestMove, lastMove, playedClassification, sideToMove, boardLayout]);

  // Files and ranks order based on orientation
  const files = orientation === 'w' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
  const ranks = orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];

  const currentTheme = THEME_COLORS[theme];

  return (
    <div
      className="chessboard-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '640px',
        aspectRatio: '1 / 1',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow:
          '0 20px 48px -8px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.12)',
        userSelect: 'none',
        border: `4px solid ${currentTheme.border}`,
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
            const bg = isLight ? currentTheme.light : currentTheme.dark;

            const isInteractiveSquare = (piece && piece.color === sideToMove) || isDestination;
            const squareLabel = piece
              ? `${square} ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}`
              : isDestination
              ? `${square} legal destination`
              : square;

            return (
              <div
                key={square}
                role={isInteractiveSquare ? 'button' : undefined}
                tabIndex={isInteractiveSquare ? 0 : undefined}
                aria-label={squareLabel}
                onClick={() => handleSquareClick(square)}
                onKeyDown={(e) => {
                  if (isInteractiveSquare && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSquareClick(square);
                  }
                }}
                style={{
                  position: 'relative',
                  backgroundColor: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isInteractiveSquare ? 'pointer' : 'default',
                  transition: 'background-color 0.15s ease',
                  overflow: 'hidden',
                }}
              >
                {/* Architectural Last Move Indicator */}
                {(isLastMoveFrom || isLastMoveTo) && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: isLight ? 'rgba(200, 170, 110, 0.28)' : 'rgba(180, 150, 90, 0.38)',
                      boxShadow: 'inset 0 0 0 1px rgba(200, 170, 110, 0.45)',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Selected Square Precision Frame */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '2px',
                      borderRadius: '3px',
                      border: '2px solid #c8aa6e',
                      backgroundColor: 'rgba(200, 170, 110, 0.2)',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Coordinates */}
                {fileIdx === 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '3px',
                      left: '4px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: isLight ? currentTheme.dark : currentTheme.light,
                      opacity: 0.85,
                      pointerEvents: 'none',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {rank}
                  </span>
                )}
                {rankIdx === 7 && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '4px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: isLight ? currentTheme.dark : currentTheme.light,
                      opacity: 0.85,
                      pointerEvents: 'none',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {file}
                  </span>
                )}

                {/* Check warning square */}
                {isCheckSquare && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(239, 68, 68, 0.45)',
                      boxShadow: 'inset 0 0 0 2px #ef4444',
                      animation: 'checkPulse 1.5s infinite ease-in-out',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Legal destination indicator */}
                {isDestination && !piece && (
                  <div
                    style={{
                      width: '26%',
                      height: '26%',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(200, 170, 110, 0.75)',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                {isDestination && piece && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '3px',
                      borderRadius: '50%',
                      border: '3px solid rgba(239, 68, 68, 0.85)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
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
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
          }}
        >
          <div
            style={{
              backgroundColor: '#0f121a',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {['q', 'r', 'b', 'n'].map((promoPiece) => {
              const pieceName = promoPiece === 'q' ? 'Queen' : promoPiece === 'r' ? 'Rook' : promoPiece === 'b' ? 'Bishop' : 'Knight';
              return (
                <button
                  key={promoPiece}
                  type="button"
                  aria-label={`Promote pawn to ${pieceName}`}
                  onClick={() => {
                    executeMove(promotionPending.from, promotionPending.to, promoPiece);
                    setPromotionPending(null);
                  }}
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#1c2230',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                    transition: 'background-color 0.15s ease, transform 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#252b3d';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1c2230';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ width: '44px', height: '44px' }}>
                    <PieceSvg piece={promoPiece} color={promotionPending.color} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
