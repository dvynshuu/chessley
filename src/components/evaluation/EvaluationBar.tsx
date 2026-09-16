import React from 'react';
import { EngineScore, PieceColor } from '../../chess/types';
import { getEvaluationBarPercentage, formatScore } from '../../chess/EvaluationUtils';

interface EvaluationBarProps {
  score: EngineScore | null;
  orientation: PieceColor;
  isAnalyzing?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  score,
  orientation,
  isAnalyzing = false,
}) => {
  const currentScore = score || { type: 'cp', value: 0 };
  const whitePercent = getEvaluationBarPercentage(currentScore);
  const displayPercent = orientation === 'w' ? whitePercent : 100 - whitePercent;
  const scoreText = formatScore(currentScore, orientation);

  const isWhiteAdvantage = currentScore.type === 'mate' ? currentScore.value > 0 : currentScore.value >= 0;

  return (
    <div
      style={{
        width: '32px',
        height: '100%',
        minHeight: '260px',
        backgroundColor: '#1e293b', // Black's fill
        borderRadius: '6px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        userSelect: 'none',
      }}
    >
      {/* White portion of the evaluation bar */}
      <div
        style={{
          width: '100%',
          height: `${displayPercent}%`,
          backgroundColor: '#f8fafc',
          transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Score Text Badge */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          [orientation === 'w'
            ? isWhiteAdvantage
              ? 'bottom'
              : 'top'
            : isWhiteAdvantage
            ? 'top'
            : 'bottom']: '6px',
          textAlign: 'center',
          fontSize: '11px',
          fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
          color: (orientation === 'w' ? isWhiteAdvantage : !isWhiteAdvantage) ? '#0f172a' : '#ffffff',
          pointerEvents: 'none',
          letterSpacing: '-0.5px',
        }}
      >
        {scoreText}
      </div>

      {/* Pulsing indicator when Stockfish is actively calculating */}
      {isAnalyzing && (
        <div
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 6px #10b981',
            animation: 'pulse 1s infinite',
          }}
        />
      )}
    </div>
  );
};
