import React from 'react';
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

  if (!isOpen) return null;

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
        zIndex: 55,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
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
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Settings & Engine</h2>
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
              <Palette size={16} color="#38bdf8" />
              Board Theme
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {(['tournament', 'dark', 'glass', 'wood'] as BoardTheme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setBoardTheme(theme)}
                  style={{
                    padding: '8px',
                    backgroundColor: boardTheme === theme ? '#2563eb' : '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
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
              <Sliders size={16} color="#10b981" />
              Analysis Profile
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {(['fast', 'balanced', 'deep'] as EngineMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setEngineMode(mode)}
                  style={{
                    padding: '8px',
                    backgroundColor: engineMode === mode ? '#2563eb' : '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Depth Slider */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Target Depth</span>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>{depth}</span>
              </div>
              <input
                type="range"
                min={10}
                max={22}
                value={depth}
                onChange={(e) => setDepth(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>
          </div>

          {/* Audio & Visual Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8' }}>
              Preferences
            </div>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={16} color="#38bdf8" />
                Show Best Move & Blunder Arrows
              </span>
              <input
                type="checkbox"
                checked={showArrows}
                onChange={(e) => setShowArrows(e.target.checked)}
                style={{ accentColor: '#2563eb', transform: 'scale(1.2)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {soundEnabled ? <Volume2 size={16} color="#10b981" /> : <VolumeX size={16} color="#64748b" />}
                Procedural Sound Synthesizer
              </span>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                style={{ accentColor: '#2563eb', transform: 'scale(1.2)' }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
