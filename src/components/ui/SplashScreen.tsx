import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
  forceShow?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDurationMs = 2400,
  forceShow = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(12);
  const [statusText, setStatusText] = useState('Initializing Stockfish 19 Wasm...');

  useEffect(() => {
    // Check if user already saw splash in current browser session
    const hasSeen = sessionStorage.getItem('chessley_splash_viewed');
    if (hasSeen && !forceShow) {
      if (onComplete) onComplete();
      return;
    }

    setIsVisible(true);

    // Dynamic boot progress steps
    const step1 = setTimeout(() => {
      setProgress(48);
      setStatusText('Calibrating Neural Architecture & Multi-Threads...');
    }, minDurationMs * 0.28);

    const step2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Loading Master Opening & Endgame Syzygy Tables...');
    }, minDurationMs * 0.65);

    const step3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Precision Grandmaster Workstation Ready');
    }, minDurationMs * 0.9);

    const finishTimer = setTimeout(() => {
      dismiss();
    }, minDurationMs + 400);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(finishTimer);
    };
  }, [minDurationMs, forceShow, onComplete]);

  const dismiss = () => {
    sessionStorage.setItem('chessley_splash_viewed', 'true');
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 500);
  };

  // Keyboard dismiss (Space, Enter, Escape)
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        dismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Chessley Startup Screen"
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#080a0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isFadingOut ? 'scale(1.02)' : 'scale(1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Top Skip Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '28px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#94a3b8',
          letterSpacing: '0.4px',
          padding: '6px 12px',
          borderRadius: '6px',
          background: '#0f121a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
        }}
      >
        Press Space or Click to skip
      </div>

      {/* Centerpiece Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          maxWidth: '460px',
          width: '90%',
          textAlign: 'center',
          animation: 'fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Architectural Knight Emblem Tile */}
        <div
          style={{
            position: 'relative',
            width: '136px',
            height: '136px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/icons/icon-512x512.png"
            alt="Chessley Master Emblem"
            width={128}
            height={128}
            style={{
              objectFit: 'contain',
              borderRadius: '24px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(200, 170, 110, 0.3)',
              backgroundColor: '#0f121a',
              zIndex: 2,
            }}
          />
        </div>

        {/* Brand Typography */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 900,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              margin: 0,
              fontFamily: "'Inter', sans-serif",
              color: '#f8fafc',
            }}
          >
            CHESSLEY
          </h1>

          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Precision Stockfish 19 Workstation
          </div>
        </div>

        {/* Loading Progress Bar & Status */}
        <div style={{ width: '100%', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#151923',
              borderRadius: '2px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#c8aa6e',
                borderRadius: '2px',
                transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: '#64748b',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span style={{ color: '#94a3b8' }}>{statusText}</span>
            <span style={{ color: '#c8aa6e', fontWeight: 700 }}>{progress}%</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
