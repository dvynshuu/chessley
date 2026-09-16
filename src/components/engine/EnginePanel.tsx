import React from 'react';
import { EngineAnalysisResult, EngineInfo, EngineMode } from '../../engine/stockfish/EngineTypes';
import { MoveAnalysis } from '../../chess/types';
import { formatScore } from '../../chess/EvaluationUtils';
import { Cpu, Award } from 'lucide-react';
import { CLASSIFICATION_META } from '../../chess/Classification';

interface EnginePanelProps {
  interactiveResult: EngineAnalysisResult | null;
  interactiveInfo: EngineInfo | null;
  isEvaluating: boolean;
  currentMoveAnalysis?: MoveAnalysis | null;
  engineMode: EngineMode;
  onSetEngineMode: (mode: EngineMode) => void;
}

export const EnginePanel: React.FC<EnginePanelProps> = ({
  interactiveResult,
  interactiveInfo,
  isEvaluating,
  currentMoveAnalysis,
  engineMode,
  onSetEngineMode,
}) => {
  const depth = interactiveInfo?.depth || interactiveResult?.depth || currentMoveAnalysis?.depth || 0;
  const nodes = interactiveInfo?.nodes || interactiveResult?.nodes || currentMoveAnalysis?.nodes;
  const nps = interactiveInfo?.nps || interactiveResult?.nps;
  const pv = interactiveInfo?.pv || interactiveResult?.principalVariation || currentMoveAnalysis?.principalVariation || [];

  const score = interactiveResult?.normalizedScore || currentMoveAnalysis?.playedScoreAfter || { type: 'cp', value: 0 };
  const bestMove = interactiveResult?.bestMove || currentMoveAnalysis?.bestMove || (pv[0] ?? '');

  const formatNodes = (num?: number) => {
    if (!num) return '—';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return String(num);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '14px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header with Engine Mode Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={16} color="#38bdf8" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.2px' }}>
            Stockfish 19 WASM
          </span>
          {isEvaluating && (
            <span
              style={{
                fontSize: '11px',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  animation: 'pulse 1s infinite',
                }}
              />
              evaluating
            </span>
          )}
        </div>

        {/* Preset Selector */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#1e293b', padding: '2px', borderRadius: '6px' }}>
          {(['fast', 'balanced', 'deep'] as EngineMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onSetEngineMode(mode)}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '4px',
                backgroundColor: engineMode === mode ? '#2563eb' : 'transparent',
                color: engineMode === mode ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'background-color 0.1s',
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '6px',
            padding: '8px 10px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>
            Evaluation
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              color: score.type === 'mate' ? '#38bdf8' : score.value >= 0 ? '#f8fafc' : '#94a3b8',
            }}
          >
            {formatScore(score)}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '6px',
            padding: '8px 10px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>
            Depth
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#38bdf8',
            }}
          >
            {depth > 0 ? depth : '—'}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '6px',
            padding: '8px 10px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>
            Nodes / NPS
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#94a3b8',
              marginTop: '3px',
            }}
          >
            {formatNodes(nodes)} {nps ? `(${formatNodes(nps)}/s)` : ''}
          </div>
        </div>
      </div>

      {/* Played Move Classification Card (if analyzed) */}
      {currentMoveAnalysis && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: CLASSIFICATION_META[currentMoveAnalysis.classification]?.bgColor || '#1e293b',
            border: `1px solid ${CLASSIFICATION_META[currentMoveAnalysis.classification]?.color || 'transparent'}`,
            borderRadius: '6px',
            padding: '8px 12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color={CLASSIFICATION_META[currentMoveAnalysis.classification]?.color} />
            <div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: CLASSIFICATION_META[currentMoveAnalysis.classification]?.color,
                }}
              >
                {CLASSIFICATION_META[currentMoveAnalysis.classification]?.name} ({currentMoveAnalysis.san})
              </span>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Accuracy: {currentMoveAnalysis.moveAccuracy}% | Loss: -{currentMoveAnalysis.winProbabilityLoss}%
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: CLASSIFICATION_META[currentMoveAnalysis.classification]?.color,
            }}
          >
            {CLASSIFICATION_META[currentMoveAnalysis.classification]?.symbol}
          </div>
        </div>
      )}

      {/* Best Move & Principal Variation (PV) */}
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '6px',
          padding: '10px',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
            Recommended Best Line:
          </span>
          {bestMove && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#10b981',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ★ {bestMove}
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: '12px',
            fontFamily: "'JetBrains Mono', monospace",
            color: '#cbd5e1',
            lineHeight: 1.5,
            wordBreak: 'break-word',
          }}
        >
          {pv.length > 0 ? (
            pv.slice(0, 12).map((moveUci, idx) => (
              <span
                key={`${moveUci}_${idx}`}
                style={{
                  display: 'inline-block',
                  marginRight: '6px',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  backgroundColor: idx === 0 ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: idx === 0 ? '#10b981' : '#cbd5e1',
                  fontWeight: idx === 0 ? 700 : 500,
                }}
              >
                {moveUci}
              </span>
            ))
          ) : (
            <span style={{ color: '#64748b', fontStyle: 'italic' }}>Calculating principal variation...</span>
          )}
        </div>
      </div>
    </div>
  );
};
