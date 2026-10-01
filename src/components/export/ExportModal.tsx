import React, { useState } from 'react';
import { X, Copy, Check, FileText, Code } from 'lucide-react';
import { ChessGame, MoveAnalysis } from '../../chess/types';
import { exportAnnotatedPgn } from '../../chess/PgnParser';

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

  const annotatedPgn = exportAnnotatedPgn(game, analyses);
  const jsonExport = JSON.stringify({ game, analyses, exportedAt: new Date().toISOString() }, null, 2);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
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
        zIndex: 55,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          backgroundColor: '#0f121a',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px -8px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          fontFamily: "'Inter', sans-serif",
          color: '#f8fafc',
          overflowY: 'auto',
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
          <h2 id="export-modal-title" className="text-balance" style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>
            Export Analysis
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export modal"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1c2230';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Content Options */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Annotated PGN */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#151923',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="#10b981" aria-hidden="true" />
                Annotated PGN
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Includes Stockfish evaluations and classification comments
              </div>
            </div>
            <button
              type="button"
              aria-live="polite"
              aria-label="Copy annotated PGN to clipboard"
              onClick={() => copyToClipboard(annotatedPgn, 'annotated')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: copiedType === 'annotated' ? '#10b981' : '#2563eb',
                border: copiedType === 'annotated' ? '1px solid #10b981' : '1px solid #3b82f6',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                transition: 'background-color 0.15s ease',
              }}
            >
              {copiedType === 'annotated' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
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
              backgroundColor: '#151923',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="#c8aa6e" aria-hidden="true" />
                Raw PGN
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Standard original PGN text
              </div>
            </div>
            <button
              type="button"
              aria-live="polite"
              aria-label="Copy raw PGN to clipboard"
              onClick={() => copyToClipboard(game.pgn, 'raw')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: copiedType === 'raw' ? '#10b981' : '#2563eb',
                border: copiedType === 'raw' ? '1px solid #10b981' : '1px solid #3b82f6',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                transition: 'background-color 0.15s ease',
              }}
            >
              {copiedType === 'raw' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
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
              backgroundColor: '#151923',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code size={16} color="#94a3b8" aria-hidden="true" />
                JSON Analysis Dump
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Machine-readable metrics for every move
              </div>
            </div>
            <button
              type="button"
              aria-live="polite"
              aria-label="Copy JSON analysis to clipboard"
              onClick={() => copyToClipboard(jsonExport, 'json')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: copiedType === 'json' ? '#10b981' : '#2563eb',
                border: copiedType === 'json' ? '1px solid #10b981' : '1px solid #3b82f6',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                transition: 'background-color 0.15s ease',
              }}
            >
              {copiedType === 'json' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
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
              backgroundColor: '#151923',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ maxWidth: '75%', overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Current FEN</div>
              <div
                className="tabular-nums"
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
              type="button"
              aria-live="polite"
              aria-label="Copy current FEN to clipboard"
              onClick={() => copyToClipboard(currentFen, 'fen')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: copiedType === 'fen' ? '#10b981' : '#2563eb',
                border: copiedType === 'fen' ? '1px solid #10b981' : '1px solid #3b82f6',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                transition: 'background-color 0.15s ease',
              }}
            >
              {copiedType === 'fen' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              {copiedType === 'fen' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
