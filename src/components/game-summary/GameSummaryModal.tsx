import React from 'react';
import { GameSummary, ChessGame, MoveAnalysis } from '../../chess/types';
import { CLASSIFICATION_META } from '../../chess/Classification';
import { X, Award, AlertTriangle, Download } from 'lucide-react';

interface GameSummaryModalProps {
  game: ChessGame;
  summary: GameSummary;
  analyses: Record<number, MoveAnalysis>;
  isOpen: boolean;
  onClose: () => void;
  onSelectPly: (ply: number) => void;
  onOpenExport: () => void;
}

export const GameSummaryModal: React.FC<GameSummaryModalProps> = ({
  game,
  summary,
  analyses,
  isOpen,
  onClose,
  onSelectPly,
  onOpenExport,
}) => {
  if (!isOpen) return null;

  const classifications = [
    'brilliant',
    'great',
    'best',
    'excellent',
    'good',
    'inaccuracy',
    'mistake',
    'blunder',
    'missed_win',
  ] as const;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          fontFamily: "'Inter', sans-serif",
          color: '#f8fafc',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Game Review & Accuracy</h2>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              {game.white.name} vs {game.black.name} ({game.result})
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Accuracy Score Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
            }}
          >
            {/* White Accuracy */}
            <div
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                {game.white.name} (White)
              </div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: '#10b981',
                  margin: '8px 0',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {summary.whiteAccuracy}%
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Overall Accuracy</div>
            </div>

            {/* Black Accuracy */}
            <div
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                {game.black.name} (Black)
              </div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: '#38bdf8',
                  margin: '8px 0',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {summary.blackAccuracy}%
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Overall Accuracy</div>
            </div>
          </div>

          {/* Classification Breakdown Table */}
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              padding: '14px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#94a3b8',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Award size={16} color="#38bdf8" />
              Move Classification Breakdown
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {classifications.map((key) => {
                const meta = CLASSIFICATION_META[key];
                const countW = summary.classificationCounts.w[key] || 0;
                const countB = summary.classificationCounts.b[key] || 0;

                return (
                  <div
                    key={key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 40px',
                      alignItems: 'center',
                      fontSize: '12px',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <span style={{ fontWeight: 700, textAlign: 'center', color: '#f8fafc' }}>
                      {countW}
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'center',
                        color: meta.color,
                        fontWeight: 700,
                      }}
                    >
                      <span>{meta.symbol}</span>
                      <span>{meta.name}</span>
                    </span>
                    <span style={{ fontWeight: 700, textAlign: 'center', color: '#f8fafc' }}>
                      {countB}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase Performance Breakdown */}
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              padding: '14px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px' }}>
              Phase Accuracy
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Opening</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>
                  W: {summary.openingAccuracy.w}% | B: {summary.openingAccuracy.b}%
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Middlegame</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>
                  W: {summary.middlegameAccuracy.w}% | B: {summary.middlegameAccuracy.b}%
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Endgame</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>
                  W: {summary.endgameAccuracy.w}% | B: {summary.endgameAccuracy.b}%
                </div>
              </div>
            </div>
          </div>

          {/* Critical Moments Carousel */}
          {summary.criticalMoments.length > 0 && (
            <div
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '8px',
                padding: '14px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#ef4444',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertTriangle size={16} />
                Critical Moments ({summary.criticalMoments.length})
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {summary.criticalMoments.slice(0, 10).map((ply) => {
                  const a = analyses[ply];
                  if (!a) return null;
                  const meta = CLASSIFICATION_META[a.classification];

                  return (
                    <button
                      key={`crit_${ply}`}
                      onClick={() => {
                        onSelectPly(ply);
                        onClose();
                      }}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#0f172a',
                        border: `1px solid ${meta.color}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        minWidth: '130px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Move {a.moveNumber}{a.color === 'w' ? '' : '...'}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: meta.color }}>
                          {meta.symbol}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                        {a.san}
                      </div>
                      <div style={{ fontSize: '10px', color: '#ef4444' }}>
                        Loss: -{a.winProbabilityLoss}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '14px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#0b1120',
          }}
        >
          <button
            onClick={onOpenExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={16} />
            Export Analysis
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
};
