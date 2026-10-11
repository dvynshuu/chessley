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
  const scoreText = formatScore(currentScore, 'w');

  const isWhiteLeading =
    currentScore.type === 'mate'
      ? currentScore.value > 0 || (currentScore.value === 0 && !Object.is(currentScore.value, -0))
      : currentScore.value >= 0;

  // Determine badge placement on the leading player's portion of the bar
  const isBadgeAtBottom = orientation === 'w' ? isWhiteLeading : !isWhiteLeading;

  return (
    <div
      role="meter"
      aria-label={`Position evaluation: ${scoreText}`}
      aria-valuenow={Math.round(whitePercent)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        width: '34px',
        height: '100%',
        minHeight: '260px',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: orientation === 'w' ? 'column' : 'column-reverse',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        userSelect: 'none',
        backgroundColor: '#10141d',
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
            backgroundColor: 'rgba(255, 255, 255, 0.35)',
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
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          }}
        />
      </div>

      {/* Black block of the evaluation bar */}
      <div
        style={{
          width: '100%',
          height: `${100 - whitePercent}%`,
          backgroundColor: '#10141d',
          transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* White block of the evaluation bar */}
      <div
        style={{
          width: '100%',
          height: `${whitePercent}%`,
          backgroundColor: '#f8fafc',
          transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Score Text Badge */}
      <div
        className="tabular-nums"
        style={{
          position: 'absolute',
          left: '3px',
          right: '3px',
          [isBadgeAtBottom ? 'bottom' : 'top']: '6px',
          textAlign: 'center',
          fontSize: '11px',
          fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
          padding: '2px 0',
          borderRadius: '4px',
          backgroundColor: isWhiteLeading ? '#080a0f' : '#ffffff',
          color: isWhiteLeading ? '#f8fafc' : '#080a0f',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          pointerEvents: 'none',
          letterSpacing: '-0.3px',
          zIndex: 10,
        }}
      >
        {scoreText}
      </div>

      {/* Active calculation indicator */}
      {isAnalyzing && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
            animation: 'pulse 1.2s infinite',
            zIndex: 15,
          }}
        />
      )}
    </div>
  );
};
