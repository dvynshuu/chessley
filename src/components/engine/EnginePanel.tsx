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
        gap: '14px',
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        padding: '16px',
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
          <Cpu size={16} color={engineMode === 'max' ? '#a78bfa' : '#38bdf8'} aria-hidden="true" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.2px' }}>
            Stockfish 19 {engineMode === 'max' ? 'Max Level' : 'WASM'}
          </span>
          {engineMode === 'max' && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '4px',
                backgroundColor: 'rgba(124, 58, 237, 0.25)',
                color: '#c4b5fd',
                border: '1px solid rgba(167, 139, 250, 0.4)',
              }}
            >
              LVL 20
            </span>
          )}
          {isEvaluating && (
            <span
              aria-live="polite"
              style={{
                fontSize: '11px',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  animation: 'pulse 1s infinite',
                }}
              />
              Evaluating…
            </span>
          )}
        </div>

        {/* Preset Selector */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#1e293b', padding: '2px', borderRadius: '6px' }}>
          {(['fast', 'balanced', 'deep', 'max'] as EngineMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={engineMode === mode}
              onClick={() => onSetEngineMode(mode)}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '4px',
                backgroundColor:
                  engineMode === mode
                    ? mode === 'max'
                      ? '#7c3aed'
                      : '#2563eb'
                    : 'transparent',
                color: engineMode === mode ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'background-color 0.1s ease, color 0.1s ease',
                boxShadow: engineMode === mode && mode === 'max' ? '0 0 8px rgba(124, 58, 237, 0.4)' : 'none',
              }}
            >
              {mode === 'max' ? '★ Max' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.65)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '10px 12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
            Evaluation
          </div>
          <div
            className="tabular-nums"
            style={{
              fontSize: '17px',
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
            backgroundColor: 'rgba(30, 41, 59, 0.65)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '10px 12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
            Depth
          </div>
          <div
            className="tabular-nums"
            style={{
              fontSize: '17px',
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              color: depth >= 24 ? '#c4b5fd' : '#38bdf8',
            }}
          >
            {depth > 0 ? depth : '—'}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.65)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '10px 12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
            Nodes / NPS
          </div>
          <div
            className="tabular-nums"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#e2e8f0',
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
            backgroundColor: CLASSIFICATION_META[currentMoveAnalysis.classification]?.bgColor || 'rgba(30, 41, 59, 0.7)',
            border: `1px solid ${CLASSIFICATION_META[currentMoveAnalysis.classification]?.color || 'transparent'}`,
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={18} color={CLASSIFICATION_META[currentMoveAnalysis.classification]?.color} aria-hidden="true" />
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
              <div className="tabular-nums" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Accuracy: {currentMoveAnalysis.moveAccuracy}% | Loss: -{currentMoveAnalysis.winProbabilityLoss}%
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: '15px',
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
          backgroundColor: 'rgba(30, 41, 59, 0.65)',
          backdropFilter: 'blur(10px)',
          borderRadius: '8px',
          padding: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
            Recommended Best Line:
          </span>
          {bestMove && (
            <span
              className="tabular-nums"
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
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
            lineHeight: 1.6,
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
                  marginBottom: '4px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: idx === 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: idx === 0 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                  color: idx === 0 ? '#34d399' : '#e2e8f0',
                  fontWeight: idx === 0 ? 800 : 500,
                }}
              >
                {moveUci}
              </span>
            ))
          ) : (
            <span style={{ color: '#64748b', fontStyle: 'italic' }}>Calculating principal variation…</span>
          )}
        </div>
      </div>
    </div>
  );
};
