import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
          backgroundColor: '#0f121a',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 64px -8px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08)',
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
            <h2 id="summary-modal-title" className="text-balance" style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
              Game Review & Accuracy
            </h2>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              {game.white.name} vs {game.black.name} ({game.result})
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close game review dialog"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} aria-hidden="true" />
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
                backgroundColor: '#151923',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                {game.white.name} (White)
              </div>
              <div
                className="tabular-nums"
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
                backgroundColor: '#151923',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                {game.black.name} (Black)
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: '#c8aa6e',
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
              <Award size={16} color="#38bdf8" aria-hidden="true" />
              Move Classification Breakdown
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <caption className="sr-only">Move classification breakdown comparing White and Black counts</caption>
              <thead>
                <tr style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  <th scope="col" style={{ padding: '4px 8px', textAlign: 'center', width: '50px' }}>White</th>
                  <th scope="col" style={{ padding: '4px 8px', textAlign: 'center' }}>Classification</th>
                  <th scope="col" style={{ padding: '4px 8px', textAlign: 'center', width: '50px' }}>Black</th>
                </tr>
              </thead>
              <tbody>
                {classifications.map((key) => {
                  const meta = CLASSIFICATION_META[key];
                  const countW = summary.classificationCounts.w[key] || 0;
                  const countB = summary.classificationCounts.b[key] || 0;

                  return (
                    <tr
                      key={key}
                      className="tabular-nums"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                      }}
                    >
                      <td style={{ fontWeight: 700, textAlign: 'center', color: '#f8fafc', padding: '6px 8px' }}>
                        {countW}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          color: meta.color,
                          fontWeight: 700,
                          padding: '6px 8px',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <span aria-hidden="true">{meta.symbol}</span>
                          <span>{meta.name}</span>
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, textAlign: 'center', color: '#f8fafc', padding: '6px 8px' }}>
                        {countB}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
            {(() => {
              const fmtAcc = (val: number) => (val > 0 ? `${val}%` : '—');
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Opening</div>
                    <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>
                      W: {fmtAcc(summary.openingAccuracy.w)} | B: {fmtAcc(summary.openingAccuracy.b)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Middlegame</div>
                    <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>
                      W: {fmtAcc(summary.middlegameAccuracy.w)} | B: {fmtAcc(summary.middlegameAccuracy.b)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Endgame</div>
                    <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>
                      W: {fmtAcc(summary.endgameAccuracy.w)} | B: {fmtAcc(summary.endgameAccuracy.b)}
                    </div>
                  </div>
                </div>
              );
            })()}
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
                <AlertTriangle size={16} aria-hidden="true" />
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
                      type="button"
                      aria-label={`Jump to move ${a.moveNumber}${a.color === 'w' ? '' : '…'} ${a.san}, ${meta.name}`}
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
                        transition: 'background-color 0.15s ease, transform 0.1s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="tabular-nums" style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Move {a.moveNumber}{a.color === 'w' ? '' : '…'}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: meta.color }} aria-hidden="true">
                          {meta.symbol}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                        {a.san}
                      </div>
                      <div className="tabular-nums" style={{ fontSize: '10px', color: '#ef4444' }}>
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
            backgroundColor: '#090c13',
          }}
        >
          <button
            type="button"
            onClick={onOpenExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#151923',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1c2230';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#151923';
            }}
          >
            <Download size={16} aria-hidden="true" />
            Export Analysis
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              backgroundColor: '#2563eb',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
};
