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
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 28px',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ChessleyLogo size={36} withWordmark />
      </div>

      {/* Center Actions / Analysis Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {analysisStatus === 'idle' && (
          <button
            type="button"
            onClick={onStartAnalysis}
            aria-label="Analyze entire chess game"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
              transition: 'background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease',
            }}
          >
            <Play size={15} fill="#ffffff" aria-hidden="true" />
            Analyze Game
          </button>
        )}

        {analysisStatus === 'analyzing' && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
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
                padding: '8px 14px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
              }}
            >
              <Pause size={14} aria-hidden="true" />
              Pause ({progressPercent}%)
            </button>
            <div
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Analysis progress"
              style={{
                width: '90px',
                height: '7px',
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
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
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
              transition: 'background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease',
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
              padding: '8px 16px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.6)',
              borderRadius: '8px',
              color: '#34d399',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(16, 185, 129, 0.25)',
              backdropFilter: 'blur(8px)',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
          >
            <CheckCircle size={15} aria-hidden="true" />
            Review Summary
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
              padding: '8px 14px',
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.15)',
              backdropFilter: 'blur(8px)',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
          >
            <Award size={15} color="#38bdf8" aria-hidden="true" />
            Summary
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={onOpenImport}
          aria-label="Import game from Chess.com or PGN"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 0 16px rgba(37, 99, 235, 0.4)',
            transition: 'background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease',
          }}
        >
          <Upload size={15} aria-hidden="true" />
          Import
        </button>

        <button
          type="button"
          onClick={onOpenExport}
          title="Export Analysis"
          aria-label="Export analysis"
          style={{
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, color 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <Download size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onFlipBoard}
          title="Flip Board"
          aria-label="Flip board orientation"
          style={{
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, color 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <RotateCcw size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          title="Settings"
          aria-label="Open settings and engine configurations"
          style={{
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, color 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <Settings size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};
