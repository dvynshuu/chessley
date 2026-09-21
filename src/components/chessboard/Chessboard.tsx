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
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow:
          '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12), 0 0 35px rgba(124, 58, 237, 0.15)',
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
                {/* Subtle Last Move Glow Overlay */}
                {(isLastMoveFrom || isLastMoveTo) && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: isLight ? 'rgba(250, 204, 21, 0.35)' : 'rgba(234, 179, 8, 0.42)',
                      boxShadow: 'inset 0 0 14px rgba(250, 204, 21, 0.3)',
                      animation: 'lastMovePulse 2.5s infinite ease-in-out',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Selected Square Neon Ring */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '2px',
                      borderRadius: '4px',
                      boxShadow: 'inset 0 0 0 2.5px #38bdf8, 0 0 14px rgba(56, 189, 248, 0.65)',
                      backgroundColor: 'rgba(56, 189, 248, 0.2)',
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

                {/* Check danger glow */}
                {isCheckSquare && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle, rgba(239, 68, 68, 0.95) 0%, rgba(239, 68, 68, 0.15) 75%)',
                      animation: 'checkPulse 1.5s infinite ease-in-out',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Legal destination indicator */}
                {isDestination && !piece && (
                  <div
                    style={{
                      width: '28%',
                      height: '28%',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(56, 189, 248, 0.7)',
                      boxShadow: '0 0 10px rgba(56, 189, 248, 0.8)',
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
                      border: '3.5px solid rgba(239, 68, 68, 0.75)',
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.5), inset 0 0 8px rgba(239, 68, 68, 0.25)',
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
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              backdropFilter: 'blur(16px)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(124, 58, 237, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
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
                    backgroundColor: 'rgba(51, 65, 85, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    transition: 'background-color 0.15s ease, transform 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#475569';
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.8)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ width: '44px', height: '44px' }}>
                    <PieceSvg piece={promoPiece} color={sideToMove} />
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
