import React, { useEffect } from 'react';
import { X, Sliders, Palette, Volume2, VolumeX, Eye } from 'lucide-react';
import { useSettingsStore, BoardTheme } from '../../state/settingsStore';
import { EngineMode } from '../../engine/stockfish/EngineTypes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    boardTheme,
    engineMode,
    depth,
    showArrows,
    soundEnabled,
    setBoardTheme,
    setEngineMode,
    setDepth,
    setShowArrows,
    setSoundEnabled,
  } = useSettingsStore();

  // Escape to close
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
          <h2 id="settings-modal-title" className="text-balance" style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>
            Settings &amp; Engine
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

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Board Theme */}
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#94a3b8',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Palette size={15} color="#c8aa6e" aria-hidden="true" />
              <span>Board Theme</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {(['tournament', 'dark', 'glass', 'wood', 'midnight'] as BoardTheme[]).map((theme) => {
                const isActive = boardTheme === theme;
                return (
                  <button
                    type="button"
                    key={theme}
                    onClick={() => setBoardTheme(theme)}
                    aria-pressed={isActive}
                    style={{
                      padding: '8px 4px',
                      backgroundColor: isActive ? '#1c2436' : '#151923',
                      border: isActive
                        ? '1px solid #c8aa6e'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      color: isActive ? '#ffffff' : '#cbd5e1',
                      fontSize: '11px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)' : '0 1px 2px rgba(0, 0, 0, 0.2)',
                      transition: 'background-color 150ms ease, border-color 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#1c2230';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#151923';
                    }}
                  >
                    {theme}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Engine Mode */}
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#94a3b8',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sliders size={15} color="#10b981" aria-hidden="true" />
              <span>Analysis Profile</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {(['fast', 'balanced', 'deep', 'max'] as EngineMode[]).map((mode) => {
                const isActive = engineMode === mode;
                return (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setEngineMode(mode)}
                    aria-pressed={isActive}
                    style={{
                      padding: '8px',
                      backgroundColor: isActive
                        ? mode === 'max'
                          ? '#c8aa6e'
                          : '#2563eb'
                        : '#151923',
                      border: isActive
                        ? mode === 'max'
                          ? '1px solid #d4ba82'
                          : '1px solid #3b82f6'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      color: isActive
                        ? mode === 'max'
                          ? '#080a0f'
                          : '#ffffff'
                        : '#cbd5e1',
                      fontSize: '12px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.2)',
                      transition: 'background-color 150ms ease, border-color 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#1c2230';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#151923';
                    }}
                  >
                    {mode === 'max' ? '★ Max' : mode}
                  </button>
                );
              })}
            </div>

            {/* Depth Slider */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <label htmlFor="settings-depth-slider" style={{ color: '#94a3b8', cursor: 'pointer' }}>
                  Target Depth (Up to Max Level 30)
                </label>
                <span className="tabular-nums" style={{ fontWeight: 700, color: depth >= 24 ? '#c8aa6e' : '#f8fafc' }}>
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
                style={{ width: '100%', accentColor: depth >= 24 ? '#c8aa6e' : '#2563eb', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Audio & Visual Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
              Preferences
            </div>

            <label
              htmlFor="settings-show-arrows"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={16} color="#94a3b8" aria-hidden="true" />
                Show Best Move &amp; Blunder Arrows
              </span>
              <input
                id="settings-show-arrows"
                type="checkbox"
                checked={showArrows}
                onChange={(e) => setShowArrows(e.target.checked)}
                style={{ accentColor: '#2563eb', transform: 'scale(1.15)', cursor: 'pointer' }}
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
                style={{ accentColor: '#2563eb', transform: 'scale(1.15)', cursor: 'pointer' }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
