import React, { useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Group moves into pairs: [Move 1 White, Move 1 Black], [Move 2 White, Move 2 Black], etc.
  const movePairs: { moveNumber: number; white?: { san: string; ply: number }; black?: { san: string; ply: number } }[] = [];
  for (let i = 0; i < game.moves.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    movePairs.push({
      moveNumber,
      white: { san: game.moves[i].san, ply: i + 1 },
      black: game.moves[i + 1] ? { san: game.moves[i + 1].san, ply: i + 2 } : undefined,
    });
  }

  // Smooth scroll container to keep current move in view
  useEffect(() => {
    if (activeItemRef.current) {
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
        backgroundColor: '#0f121a',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '8px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)',
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
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: isWhiteActive ? '#1c2436' : 'transparent',
                  color: isWhiteActive ? '#ffffff' : '#cbd5e1',
                  cursor: 'pointer',
                  fontWeight: isWhiteActive ? 800 : 500,
                  boxShadow: isWhiteActive
                    ? '0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
                    : 'none',
                  borderLeft: isWhiteActive ? '3px solid #c8aa6e' : '3px solid transparent',
                  transition: 'background-color 0.12s ease, border-left-color 0.12s ease',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (!isWhiteActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!isWhiteActive) e.currentTarget.style.backgroundColor = 'transparent';
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
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: isBlackActive ? '#1c2436' : 'transparent',
                  color: isBlackActive ? '#ffffff' : '#cbd5e1',
                  cursor: 'pointer',
                  fontWeight: isBlackActive ? 800 : 500,
                  boxShadow: isBlackActive
                    ? '0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
                    : 'none',
                  borderLeft: isBlackActive ? '3px solid #c8aa6e' : '3px solid transparent',
                  transition: 'background-color 0.12s ease, border-left-color 0.12s ease',
                  marginLeft: '4px',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (!isBlackActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!isBlackActive) e.currentTarget.style.backgroundColor = 'transparent';
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
    </div>
  );
};
