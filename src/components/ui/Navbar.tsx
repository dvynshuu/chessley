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
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 18px rgba(99, 102, 241, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>♟</span>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
              Chessley
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '5px',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(56, 189, 248, 0.35))',
                color: '#c4b5fd',
                border: '1px solid rgba(167, 139, 250, 0.5)',
                letterSpacing: '0.4px',
                boxShadow: '0 0 10px rgba(167, 139, 250, 0.25)',
              }}
            >
              v2.0 MAX
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.2px' }}>Precision Multi-Core Workstation</div>
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
              transition: 'all 0.15s ease',
            }}
          >
            <Play size={15} fill="#ffffff" />
            Analyze Game
          </button>
        )}

        {analysisStatus === 'analyzing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onPauseAnalysis}
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
              }}
            >
              <Pause size={14} />
              Pause ({progressPercent}%)
            </button>
            <div
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
            onClick={onResumeAnalysis}
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
            }}
          >
            <Play size={14} fill="#ffffff" />
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
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 0 16px rgba(37, 99, 235, 0.4)',
            transition: 'all 0.15s ease',
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
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
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
          <Download size={16} />
        </button>

        <button
          onClick={onFlipBoard}
          title="Flip Board"
          style={{
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
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
          <RotateCcw size={16} />
        </button>

        <button
          onClick={onOpenSettings}
          title="Settings"
          style={{
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
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
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
