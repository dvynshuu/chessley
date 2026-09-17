import React, { useState, useEffect } from 'react';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface BoardControlsProps {
  currentPly: number;
  totalPlies: number;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
}

export const BoardControls: React.FC<BoardControlsProps> = ({
  currentPly,
  totalPlies,
  onFirst,
  onPrev,
  onNext,
  onLast,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      if (currentPly < totalPlies) {
        onNext();
      } else {
        setIsPlaying(false);
      }
    }, 1200);

    return () => clearInterval(timer);
  }, [isPlaying, currentPly, totalPlies, onNext]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
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
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '8px 14px',
        width: '100%',
        maxWidth: '640px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
      }}
    >
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={onFirst}
          disabled={currentPly === 0}
          title="First Move (Home)"
          style={{
            padding: '8px 10px',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '6px',
            color: currentPly === 0 ? '#475569' : '#f8fafc',
            cursor: currentPly === 0 ? 'default' : 'pointer',
          }}
        >
          <ChevronFirst size={18} />
        </button>

        <button
          onClick={onPrev}
          disabled={currentPly === 0}
          title="Previous Move (←)"
          style={{
            padding: '8px 10px',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '6px',
            color: currentPly === 0 ? '#475569' : '#f8fafc',
            cursor: currentPly === 0 ? 'default' : 'pointer',
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => setIsPlaying((p) => !p)}
          title="Play / Pause (Space)"
          style={{
            padding: '8px 14px',
            background: isPlaying
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : 'linear-gradient(135deg, #2563eb, #3b82f6)',
            border: 'none',
            borderRadius: '6px',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: isPlaying
              ? '0 0 12px rgba(245, 158, 11, 0.4)'
              : '0 0 12px rgba(37, 99, 235, 0.4)',
          }}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} fill="#ffffff" />}
        </button>

        <button
          onClick={onNext}
          disabled={currentPly >= totalPlies}
          title="Next Move (→)"
          style={{
            padding: '8px 10px',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '6px',
            color: currentPly >= totalPlies ? '#475569' : '#f8fafc',
            cursor: currentPly >= totalPlies ? 'default' : 'pointer',
          }}
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={onLast}
          disabled={currentPly >= totalPlies}
          title="Last Move (End)"
          style={{
            padding: '8px 10px',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '6px',
            color: currentPly >= totalPlies ? '#475569' : '#f8fafc',
            cursor: currentPly >= totalPlies ? 'default' : 'pointer',
          }}
        >
          <ChevronLast size={18} />
        </button>
      </div>

      {/* Move Info Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '4px 10px',
          borderRadius: '20px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          fontWeight: 700,
          color: '#e2e8f0',
        }}
      >
        <span style={{ color: '#38bdf8' }}>Ply {currentPly}</span>
        <span style={{ color: '#64748b' }}>/</span>
        <span style={{ color: '#94a3b8' }}>{totalPlies}</span>
      </div>
    </div>
  );
};
