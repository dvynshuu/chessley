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
        width: '36px',
        height: '100%',
        minHeight: '260px',
        background: 'linear-gradient(to top, #0f172a, #1e293b)', // Black's fill
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.4)',
        userSelect: 'none',
      }}
    >
      {/* Advantage Tick Marks (±5, ±2, 0.00) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {/* Equality center dash */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '2px',
            right: '2px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            boxShadow: '0 0 4px rgba(0, 0, 0, 0.8)',
          }}
        />
        {/* +2 advantage mark (approx 35% from top) */}
        <div
          style={{
            position: 'absolute',
            top: '35%',
            left: '4px',
            width: '6px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
          }}
        />
        {/* -2 advantage mark (approx 65% from top) */}
        <div
          style={{
            position: 'absolute',
            top: '65%',
            left: '4px',
            width: '6px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
          }}
        />
      </div>

      {/* White portion of the evaluation bar */}
      <div
        style={{
          width: '100%',
          height: `${displayPercent}%`,
          background: 'linear-gradient(to top, #ffffff, #f1f5f9)',
          transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 -2px 10px rgba(255, 255, 255, 0.3)',
        }}
      />

      {/* Floating Glass Score Text Badge */}
      <div
        style={{
          position: 'absolute',
          left: '3px',
          right: '3px',
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
          padding: '2px 0',
          borderRadius: '4px',
          backgroundColor:
            (orientation === 'w' ? isWhiteAdvantage : !isWhiteAdvantage)
              ? 'rgba(15, 23, 42, 0.85)'
              : 'rgba(255, 255, 255, 0.9)',
          color: (orientation === 'w' ? isWhiteAdvantage : !isWhiteAdvantage) ? '#f8fafc' : '#0f172a',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          pointerEvents: 'none',
          letterSpacing: '-0.3px',
          zIndex: 10,
        }}
      >
        {scoreText}
      </div>

      {/* Pulsing indicator when Stockfish is actively calculating */}
      {isAnalyzing && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981',
            animation: 'pulse 1s infinite',
            zIndex: 15,
          }}
        />
      )}
    </div>
  );
};
