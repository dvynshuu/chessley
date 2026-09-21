import React, { useRef, useEffect } from 'react';
import { ChessGame, MoveAnalysis } from '../../chess/types';
import { formatScore } from '../../chess/EvaluationUtils';
import { CLASSIFICATION_META } from '../../chess/Classification';

interface MoveListProps {
  game: ChessGame;
  analyses: Record<number, MoveAnalysis>;
  currentPly: number;
  onSelectPly: (ply: number) => void;
}

export const MoveList: React.FC<MoveListProps> = ({
  game,
  analyses,
  currentPly,
  onSelectPly,
}) => {
  const activeItemRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Group moves into pairs (1. White Black, 2. White Black)
  const movePairs = [];
  for (let i = 0; i < game.moves.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: game.moves[i],
      black: game.moves[i + 1] || null,
    });
  }

  // Auto-scroll to active move
  useEffect(() => {
    if (activeItemRef.current && containerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentPly]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '340px',
        overflowY: 'auto',
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '8px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '13px',
      }}
    >
      {movePairs.map((pair) => {
        const whiteAnalysis = pair.white ? analyses[pair.white.ply] : null;
        const blackAnalysis = pair.black ? analyses[pair.black.ply] : null;

        const isWhiteActive = pair.white && currentPly === pair.white.ply;
        const isBlackActive = pair.black && currentPly === pair.black.ply;

        return (
          <div
            key={`move_row_${pair.moveNumber}`}
            className="virtual-row tabular-nums"
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 1fr',
              alignItems: 'center',
              padding: '2px 4px',
              borderRadius: '6px',
              backgroundColor: pair.moveNumber % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
              marginBottom: '2px',
            }}
          >
            {/* Move Number */}
            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
              {pair.moveNumber}.
            </span>

            {/* White Move */}
            {pair.white ? (
              <button
                type="button"
                ref={isWhiteActive ? activeItemRef : undefined}
                onClick={() => onSelectPly(pair.white!.ply)}
                aria-label={`Move ${pair.moveNumber}, White: ${pair.white.san}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isWhiteActive
                    ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(59, 130, 246, 0.85))'
                    : 'transparent',
                  color: isWhiteActive ? '#ffffff' : '#f1f5f9',
                  cursor: 'pointer',
                  fontWeight: isWhiteActive ? 800 : 500,
                  boxShadow: isWhiteActive
                    ? '0 2px 10px rgba(37, 99, 235, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.25)'
                    : 'none',
                  borderLeft: isWhiteActive ? '3px solid #38bdf8' : '3px solid transparent',
                  transition: 'background-color 0.12s ease, border-left-color 0.12s ease, box-shadow 0.12s ease',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
              >
                <span>{pair.white.san}</span>
                {whiteAnalysis && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                    }}
                  >
                    <span style={{ opacity: isWhiteActive ? 0.9 : 0.6, fontSize: '10px' }}>
                      {formatScore(whiteAnalysis.playedScoreAfter)}
                    </span>
                    <span
                      style={{
                        padding: '1px 4px',
                        borderRadius: '3px',
                        backgroundColor: CLASSIFICATION_META[whiteAnalysis.classification]?.bgColor || 'transparent',
                        color: CLASSIFICATION_META[whiteAnalysis.classification]?.color || '#cbd5e1',
                        fontWeight: 800,
                        fontSize: '11px',
                      }}
                    >
                      {CLASSIFICATION_META[whiteAnalysis.classification]?.symbol}
                    </span>
                  </span>
                )}
              </button>
            ) : (
              <div />
            )}

            {/* Black Move */}
            {pair.black ? (
              <button
                type="button"
                ref={isBlackActive ? activeItemRef : undefined}
                onClick={() => onSelectPly(pair.black!.ply)}
                aria-label={`Move ${pair.moveNumber}, Black: ${pair.black.san}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isBlackActive
                    ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(59, 130, 246, 0.85))'
                    : 'transparent',
                  color: isBlackActive ? '#ffffff' : '#f1f5f9',
                  cursor: 'pointer',
                  fontWeight: isBlackActive ? 800 : 500,
                  boxShadow: isBlackActive
                    ? '0 2px 10px rgba(37, 99, 235, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.25)'
                    : 'none',
                  borderLeft: isBlackActive ? '3px solid #38bdf8' : '3px solid transparent',
                  transition: 'background-color 0.12s ease, border-left-color 0.12s ease, box-shadow 0.12s ease',
                  marginLeft: '4px',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
              >
                <span>{pair.black.san}</span>
                {blackAnalysis && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                    }}
                  >
                    <span style={{ opacity: isBlackActive ? 0.9 : 0.6, fontSize: '10px' }}>
                      {formatScore(blackAnalysis.playedScoreAfter)}
                    </span>
                    <span
                      style={{
                        padding: '1px 4px',
                        borderRadius: '3px',
                        backgroundColor: CLASSIFICATION_META[blackAnalysis.classification]?.bgColor || 'transparent',
                        color: CLASSIFICATION_META[blackAnalysis.classification]?.color || '#cbd5e1',
                        fontWeight: 800,
                        fontSize: '11px',
                      }}
                    >
                      {CLASSIFICATION_META[blackAnalysis.classification]?.symbol}
                    </span>
                  </span>
                )}
              </button>
            ) : (
              <div />
            )}
          </div>
        );
      })}

      {game.moves.length === 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#64748b',
            fontStyle: 'italic',
          }}
        >
          No moves loaded yet.
        </div>
      )}
    </div>
  );
};
