import React, { useEffect } from 'react';
import { useSettingsStore, BoardTheme } from '../../state/settingsStore';
import { EngineMode } from '../../engine/stockfish/EngineTypes';
import { X, Volume2, VolumeX, Eye, Sliders, Palette } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    engineMode,
    depth,
    soundEnabled,
    showArrows,
    boardTheme,
    setEngineMode,
    setDepth,
    setSoundEnabled,
    setShowArrows,
    setBoardTheme,
  } = useSettingsStore();

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

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 55,
        padding: '16px',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.85), 0 0 35px rgba(124, 58, 237, 0.2)',
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
          <h2 id="settings-modal-title" className="text-balance" style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
            Settings & Engine
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings modal"
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
              transition: 'color 150ms ease, background-color 150ms ease',
            }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Board Theme */}
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#94a3b8',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Palette size={16} color="#38bdf8" aria-hidden="true" />
              <span>Board Theme</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {(['tournament', 'dark', 'glass', 'wood', 'midnight'] as BoardTheme[]).map((theme) => (
                <button
                  type="button"
                  key={theme}
                  onClick={() => setBoardTheme(theme)}
                  aria-pressed={boardTheme === theme}
                  style={{
                    padding: '8px 4px',
                    backgroundColor:
                      boardTheme === theme
                        ? theme === 'midnight'
                          ? '#7c3aed'
                          : '#2563eb'
                        : 'rgba(30, 41, 59, 0.7)',
                    border:
                      boardTheme === theme
                        ? '1px solid rgba(255, 255, 255, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    boxShadow: boardTheme === theme ? '0 0 10px rgba(37, 99, 235, 0.5)' : 'none',
                    transition: 'background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
                  }}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Engine Mode */}
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#94a3b8',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sliders size={16} color="#10b981" aria-hidden="true" />
              <span>Analysis Profile</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {(['fast', 'balanced', 'deep', 'max'] as EngineMode[]).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setEngineMode(mode)}
                  aria-pressed={engineMode === mode}
                  style={{
                    padding: '8px',
                    backgroundColor:
                      engineMode === mode
                        ? mode === 'max'
                          ? '#7c3aed'
                          : '#2563eb'
                        : '#1e293b',
                    border:
                      engineMode === mode && mode === 'max'
                        ? '1px solid #a78bfa'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    boxShadow: engineMode === mode && mode === 'max' ? '0 0 10px rgba(124, 58, 237, 0.5)' : 'none',
                    transition: 'background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
                  }}
                >
                  {mode === 'max' ? '★ Max' : mode}
                </button>
              ))}
            </div>

            {/* Depth Slider */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <label htmlFor="settings-depth-slider" style={{ color: '#94a3b8', cursor: 'pointer' }}>
                  Target Depth (Up to Max Level 30)
                </label>
                <span className="tabular-nums" style={{ fontWeight: 700, color: depth >= 24 ? '#a78bfa' : '#38bdf8' }}>
                  {depth}
                </span>
              </div>
              <input
                id="settings-depth-slider"
                type="range"
                min={10}
                max={30}
                value={depth}
                onChange={(e) => setDepth(parseInt(e.target.value, 10))}
                aria-label="Target engine calculation depth"
                style={{ width: '100%', accentColor: depth >= 24 ? '#7c3aed' : '#2563eb', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Audio & Visual Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8' }}>
              Preferences
            </div>

            <label
              htmlFor="settings-show-arrows"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={16} color="#38bdf8" aria-hidden="true" />
                Show Best Move &amp; Blunder Arrows
              </span>
              <input
                id="settings-show-arrows"
                type="checkbox"
                checked={showArrows}
                onChange={(e) => setShowArrows(e.target.checked)}
                style={{ accentColor: '#2563eb', transform: 'scale(1.2)', cursor: 'pointer' }}
              />
            </label>

            <label
              htmlFor="settings-sound-enabled"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {soundEnabled ? (
                  <Volume2 size={16} color="#10b981" aria-hidden="true" />
                ) : (
                  <VolumeX size={16} color="#64748b" aria-hidden="true" />
                )}
                Procedural Sound Synthesizer
              </span>
              <input
                id="settings-sound-enabled"
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                style={{ accentColor: '#2563eb', transform: 'scale(1.2)', cursor: 'pointer' }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

