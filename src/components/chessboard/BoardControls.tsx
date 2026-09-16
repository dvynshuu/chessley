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
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '6px 12px',
        width: '100%',
        maxWidth: '640px',
      }}
    >
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={onFirst}
          disabled={currentPly === 0}
          title="First Move (Home)"
          style={{
            padding: '8px',
            backgroundColor: '#1e293b',
            border: 'none',
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
            padding: '8px',
            backgroundColor: '#1e293b',
            border: 'none',
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
            padding: '8px 12px',
            backgroundColor: isPlaying ? '#f59e0b' : '#2563eb',
            border: 'none',
            borderRadius: '6px',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <button
          onClick={onNext}
          disabled={currentPly >= totalPlies}
          title="Next Move (→)"
          style={{
            padding: '8px',
            backgroundColor: '#1e293b',
            border: 'none',
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
            padding: '8px',
            backgroundColor: '#1e293b',
            border: 'none',
            borderRadius: '6px',
            color: currentPly >= totalPlies ? '#475569' : '#f8fafc',
            cursor: currentPly >= totalPlies ? 'default' : 'pointer',
          }}
        >
          <ChevronLast size={18} />
        </button>
      </div>

      {/* Move Info */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          fontWeight: 700,
          color: '#94a3b8',
        }}
      >
        Ply {currentPly} / {totalPlies}
      </div>
    </div>
  );
};
