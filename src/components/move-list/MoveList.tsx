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
  const activeItemRef = useRef<HTMLDivElement | null>(null);
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
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '6px',
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
            style={{
              display: 'grid',
              gridTemplateColumns: '38px 1fr 1fr',
              alignItems: 'center',
              padding: '3px 4px',
              borderRadius: '4px',
              backgroundColor: pair.moveNumber % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
            }}
          >
            {/* Move Number */}
            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
              {pair.moveNumber}.
            </span>

            {/* White Move */}
            {pair.white ? (
              <div
                ref={isWhiteActive ? activeItemRef : undefined}
                onClick={() => onSelectPly(pair.white.ply)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  backgroundColor: isWhiteActive ? '#2563eb' : 'transparent',
                  color: isWhiteActive ? '#ffffff' : '#f1f5f9',
                  cursor: 'pointer',
                  fontWeight: isWhiteActive ? 700 : 500,
                  transition: 'background-color 0.1s',
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
                    <span style={{ opacity: 0.75 }}>
                      {formatScore(whiteAnalysis.playedScoreAfter)}
                    </span>
                    <span
                      style={{
                        color: CLASSIFICATION_META[whiteAnalysis.classification]?.color || '#cbd5e1',
                        fontWeight: 800,
                      }}
                    >
                      {CLASSIFICATION_META[whiteAnalysis.classification]?.symbol}
                    </span>
                  </span>
                )}
              </div>
            ) : (
              <div />
            )}

            {/* Black Move */}
            {pair.black ? (
              <div
                ref={isBlackActive ? activeItemRef : undefined}
                onClick={() => onSelectPly(pair.black.ply)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  backgroundColor: isBlackActive ? '#2563eb' : 'transparent',
                  color: isBlackActive ? '#ffffff' : '#f1f5f9',
                  cursor: 'pointer',
                  fontWeight: isBlackActive ? 700 : 500,
                  transition: 'background-color 0.1s',
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
                    <span style={{ opacity: 0.75 }}>
                      {formatScore(blackAnalysis.playedScoreAfter)}
                    </span>
                    <span
                      style={{
                        color: CLASSIFICATION_META[blackAnalysis.classification]?.color || '#cbd5e1',
                        fontWeight: 800,
                      }}
                    >
                      {CLASSIFICATION_META[blackAnalysis.classification]?.symbol}
                    </span>
                  </span>
                )}
              </div>
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
