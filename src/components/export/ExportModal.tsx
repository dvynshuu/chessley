import React, { useState } from 'react';
import { ChessGame, MoveAnalysis } from '../../chess/types';
import { exportAnnotatedPgn } from '../../chess/PgnParser';
import { X, Copy, Check, FileText, Code } from 'lucide-react';

interface ExportModalProps {
  game: ChessGame;
  analyses: Record<number, MoveAnalysis>;
  currentFen: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  game,
  analyses,
  currentFen,
  isOpen,
  onClose,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const annotatedPgn = exportAnnotatedPgn(game, analyses);
  const jsonExport = JSON.stringify(
    {
      game,
      analyses,
      exportedAt: new Date().toISOString(),
      engine: 'Stockfish 19 WASM',
    },
    null,
    2
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 55,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(168, 85, 247, 0.15)',
          fontFamily: "'Inter', sans-serif",
          color: '#f8fafc',
          overflow: 'hidden',
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
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Export Analysis</h2>
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

        {/* Content Options */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Annotated PGN */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="#10b981" />
                Annotated PGN
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Includes Stockfish evaluations and classification comments
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(annotatedPgn, 'annotated')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: copiedType === 'annotated' ? '#10b981' : '#2563eb',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copiedType === 'annotated' ? <Check size={14} /> : <Copy size={14} />}
              {copiedType === 'annotated' ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Original Raw PGN */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="#38bdf8" />
                Raw PGN
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Standard original PGN text
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(game.pgn, 'raw')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: copiedType === 'raw' ? '#10b981' : '#2563eb',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copiedType === 'raw' ? <Check size={14} /> : <Copy size={14} />}
              {copiedType === 'raw' ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* JSON Analysis */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code size={16} color="#a855f7" />
                JSON Analysis Dump
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Machine-readable metrics for every move
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(jsonExport, 'json')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: copiedType === 'json' ? '#10b981' : '#2563eb',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copiedType === 'json' ? <Check size={14} /> : <Copy size={14} />}
              {copiedType === 'json' ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Current FEN */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ maxWidth: '75%', overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Current FEN</div>
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#94a3b8',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginTop: '2px',
                }}
              >
                {currentFen}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(currentFen, 'fen')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: copiedType === 'fen' ? '#10b981' : '#2563eb',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copiedType === 'fen' ? <Check size={14} /> : <Copy size={14} />}
              {copiedType === 'fen' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
