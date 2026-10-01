import React from 'react';
import { Play, Pause, RotateCcw, Upload, Settings, Award, Download, CheckCircle } from 'lucide-react';
import { AnalysisGlobalStatus } from '../../state/analysisStore';
import { ChessleyLogo } from './ChessleyLogo';

interface NavbarProps {
  analysisStatus: AnalysisGlobalStatus;
  progressPercent: number;
  hasAnalyses: boolean;
  onStartAnalysis: () => void;
  onPauseAnalysis: () => void;
  onResumeAnalysis: () => void;
  onOpenImport: () => void;
  onOpenSummary: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onFlipBoard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  analysisStatus,
  progressPercent,
  hasAnalyses,
  onStartAnalysis,
  onPauseAnalysis,
  onResumeAnalysis,
  onOpenImport,
  onOpenSummary,
  onOpenExport,
  onOpenSettings,
  onFlipBoard,
}) => {
  return (
    <header
      className="navbar-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        paddingTop: 'max(8px, env(safe-area-inset-top, 8px))',
        paddingLeft: 'max(10px, env(safe-area-inset-left, 10px))',
        paddingRight: 'max(10px, env(safe-area-inset-right, 10px))',
        backgroundColor: '#0f121a',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.6)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        gap: '8px',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <ChessleyLogo size={32} withWordmark />
      </div>

      {/* Center Actions / Analysis Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {analysisStatus === 'idle' && (
          <button
            type="button"
            onClick={onStartAnalysis}
            aria-label="Analyze entire chess game"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              minHeight: '38px',
              backgroundColor: '#059669',
              border: '1px solid #10b981',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
            }}
          >
            <Play size={14} fill="#ffffff" aria-hidden="true" />
            <span>Analyze<span className="btn-label-desktop"> Game</span></span>
          </button>
        )}

        {analysisStatus === 'analyzing' && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            aria-live="polite"
          >
            <button
              type="button"
              onClick={onPauseAnalysis}
              aria-label={`Pause analysis at ${progressPercent}%`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                minHeight: '38px',
                backgroundColor: '#1c2230',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#232a3b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1c2230';
              }}
            >
              <Pause size={13} aria-hidden="true" />
              <span>Pause<span className="btn-label-desktop"> ({progressPercent}%)</span></span>
            </button>
            <div
              className="navbar-progressbar"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Analysis progress"
              style={{
                width: '72px',
                height: '6px',
                backgroundColor: '#151923',
                borderRadius: '3px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  backgroundColor: '#10b981',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        )}

        {analysisStatus === 'paused' && (
          <button
            type="button"
            onClick={onResumeAnalysis}
            aria-label="Resume game analysis"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              minHeight: '38px',
              backgroundColor: '#d97706',
              border: '1px solid #f59e0b',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f59e0b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#d97706';
            }}
          >
            <Play size={14} fill="#ffffff" aria-hidden="true" />
            Resume
          </button>
        )}

        {analysisStatus === 'complete' && (
          <button
            type="button"
            onClick={onOpenSummary}
            aria-label="Review completed game analysis summary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              minHeight: '38px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '6px',
              color: '#34d399',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
            }}
          >
            <CheckCircle size={15} aria-hidden="true" />
            <span>Review<span className="btn-label-desktop"> Summary</span></span>
          </button>
        )}

        {hasAnalyses && analysisStatus !== 'complete' && (
          <button
            type="button"
            onClick={onOpenSummary}
            aria-label="View game summary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              minHeight: '38px',
              backgroundColor: '#1c2230',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#232a3b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1c2230';
            }}
          >
            <Award size={14} color="#c8aa6e" aria-hidden="true" />
            <span>Summary</span>
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button
          type="button"
          className="navbar-btn-import"
          onClick={onOpenImport}
          title="Import Game"
          aria-label="Import game from Chess.com or PGN"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            minHeight: '38px',
            backgroundColor: '#2563eb',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
        >
          <Upload size={15} aria-hidden="true" />
          <span className="btn-label-desktop">Import</span>
        </button>

        <button
          type="button"
          onClick={onOpenExport}
          title="Export Analysis"
          aria-label="Export analysis"
          style={{
            width: '38px',
            height: '38px',
            backgroundColor: '#151923',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: '#94a3b8',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1c2230';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#151923';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <Download size={15} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onFlipBoard}
          title="Flip Board"
          aria-label="Flip board orientation"
          style={{
            width: '38px',
            height: '38px',
            backgroundColor: '#151923',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: '#94a3b8',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1c2230';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#151923';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <RotateCcw size={15} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          title="Settings"
          aria-label="Open settings and engine configurations"
          style={{
            width: '38px',
            height: '38px',
            backgroundColor: '#151923',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: '#94a3b8',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1c2230';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#151923';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <Settings size={15} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};
