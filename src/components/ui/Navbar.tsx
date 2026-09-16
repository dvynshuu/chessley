import React from 'react';
import { Play, Pause, RotateCcw, Upload, Settings, Award, Download, CheckCircle } from 'lucide-react';
import { AnalysisGlobalStatus } from '../../state/analysisStore';

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
        padding: '12px 24px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(37, 99, 235, 0.5)',
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff' }}>♟</span>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
              Chessley
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                letterSpacing: '0.2px',
              }}
            >
              SF 19
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Precision Game Analyzer</div>
        </div>
      </div>

      {/* Center Actions / Analysis Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {analysisStatus === 'idle' && (
          <button
            onClick={onStartAnalysis}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#10b981',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              transition: 'background-color 0.15s',
            }}
          >
            <Play size={15} fill="#ffffff" />
            Analyze Game
          </button>
        )}

        {analysisStatus === 'analyzing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onPauseAnalysis}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Pause size={14} />
              Pause ({progressPercent}%)
            </button>
            <div
              style={{
                width: '80px',
                height: '6px',
                backgroundColor: '#1e293b',
                borderRadius: '3px',
                overflow: 'hidden',
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
            onClick={onResumeAnalysis}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#f59e0b',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Play size={14} />
            Resume
          </button>
        )}

        {analysisStatus === 'complete' && (
          <button
            onClick={onOpenSummary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              borderRadius: '6px',
              color: '#10b981',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <CheckCircle size={15} />
            Review Summary
          </button>
        )}

        {hasAnalyses && analysisStatus !== 'complete' && (
          <button
            onClick={onOpenSummary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Award size={15} color="#38bdf8" />
            Summary
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onOpenImport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#2563eb',
            border: 'none',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
        >
          <Upload size={15} />
          Import
        </button>

        <button
          onClick={onOpenExport}
          title="Export Analysis"
          style={{
            padding: '8px',
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
        >
          <Download size={16} />
        </button>

        <button
          onClick={onFlipBoard}
          title="Flip Board"
          style={{
            padding: '8px',
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={onOpenSettings}
          title="Settings"
          style={{
            padding: '8px',
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
