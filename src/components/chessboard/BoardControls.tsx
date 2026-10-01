import React, { useEffect, useState } from 'react';
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';

interface BoardControlsProps {
  currentPly: number;
  totalPlies: number;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  autoplayIntervalMs?: number;
}

export const BoardControls: React.FC<BoardControlsProps> = ({
  currentPly,
  totalPlies,
  onFirst,
  onPrev,
  onNext,
  onLast,
  autoplayIntervalMs = 800,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Autoplay ticker
  useEffect(() => {
    if (!isPlaying) return;

    if (currentPly >= totalPlies) {
      setIsPlaying(false);
      return;
    }

    const timer = setInterval(() => {
      onNext();
    }, autoplayIntervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, currentPly, totalPlies, onNext, autoplayIntervalMs]);

  // Global Keyboard Shortcuts (Arrow keys & Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'Home') {
        e.preventDefault();
        onFirst();
      } else if (e.key === 'End') {
        e.preventDefault();
        onLast();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrev, onNext, onFirst, onLast]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0f121a',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '8px 12px',
        width: '100%',
        maxWidth: '640px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          type="button"
          onClick={onFirst}
          disabled={currentPly === 0}
          title="First Move (Home)"
          aria-label="First move (Home)"
          style={{
            minWidth: '40px',
            minHeight: '40px',
            padding: '8px',
            backgroundColor: currentPly === 0 ? '#121620' : '#1c2230',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            color: currentPly === 0 ? '#475569' : '#f8fafc',
            cursor: currentPly === 0 ? 'default' : 'pointer',
            boxShadow: currentPly === 0 ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (currentPly > 0) e.currentTarget.style.backgroundColor = '#252b3d';
          }}
          onMouseLeave={(e) => {
            if (currentPly > 0) e.currentTarget.style.backgroundColor = '#1c2230';
          }}
        >
          <ChevronFirst size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onPrev}
          disabled={currentPly === 0}
          title="Previous Move (←)"
          aria-label="Previous move (Left arrow)"
          style={{
            minWidth: '40px',
            minHeight: '40px',
            padding: '8px',
            backgroundColor: currentPly === 0 ? '#121620' : '#1c2230',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            color: currentPly === 0 ? '#475569' : '#f8fafc',
            cursor: currentPly === 0 ? 'default' : 'pointer',
            boxShadow: currentPly === 0 ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (currentPly > 0) e.currentTarget.style.backgroundColor = '#252b3d';
          }}
          onMouseLeave={(e) => {
            if (currentPly > 0) e.currentTarget.style.backgroundColor = '#1c2230';
          }}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          title="Play / Pause (Space)"
          aria-label={isPlaying ? 'Pause autoplay (Space)' : 'Start autoplay (Space)'}
          style={{
            minWidth: '44px',
            minHeight: '40px',
            padding: '8px 12px',
            backgroundColor: isPlaying ? '#d97706' : '#2563eb',
            border: isPlaying ? '1px solid #f59e0b' : '1px solid #3b82f6',
            borderRadius: '6px',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isPlaying ? '#f59e0b' : '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isPlaying ? '#d97706' : '#2563eb';
          }}
        >
          {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} fill="#ffffff" aria-hidden="true" />}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={currentPly >= totalPlies}
          title="Next Move (→)"
          aria-label="Next move (Right arrow)"
          style={{
            minWidth: '40px',
            minHeight: '40px',
            padding: '8px',
            backgroundColor: currentPly >= totalPlies ? '#121620' : '#1c2230',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            color: currentPly >= totalPlies ? '#475569' : '#f8fafc',
            cursor: currentPly >= totalPlies ? 'default' : 'pointer',
            boxShadow: currentPly >= totalPlies ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (currentPly < totalPlies) e.currentTarget.style.backgroundColor = '#252b3d';
          }}
          onMouseLeave={(e) => {
            if (currentPly < totalPlies) e.currentTarget.style.backgroundColor = '#1c2230';
          }}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onLast}
          disabled={currentPly >= totalPlies}
          title="Last Move (End)"
          aria-label="Last move (End)"
          style={{
            minWidth: '40px',
            minHeight: '40px',
            padding: '8px',
            backgroundColor: currentPly >= totalPlies ? '#121620' : '#1c2230',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            color: currentPly >= totalPlies ? '#475569' : '#f8fafc',
            cursor: currentPly >= totalPlies ? 'default' : 'pointer',
            boxShadow: currentPly >= totalPlies ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (currentPly < totalPlies) e.currentTarget.style.backgroundColor = '#252b3d';
          }}
          onMouseLeave={(e) => {
            if (currentPly < totalPlies) e.currentTarget.style.backgroundColor = '#1c2230';
          }}
        >
          <ChevronLast size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Move Info Architectural Badge */}
      <div
        className="tabular-nums"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#151923',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '4px 10px',
          borderRadius: '4px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          fontWeight: 700,
          color: '#e2e8f0',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        }}
      >
        <span style={{ color: '#c8aa6e' }}>Ply {currentPly}</span>
        <span style={{ color: '#64748b' }}>/</span>
        <span style={{ color: '#94a3b8' }}>{totalPlies}</span>
      </div>
    </div>
  );
};
