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
    }, 550);
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
        backgroundColor: '#060911',
        backgroundImage: `
          radial-gradient(circle at 50% 45%, rgba(200, 170, 110, 0.14) 0%, transparent 60%),
          radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.05) 0%, transparent 40%),
          radial-gradient(circle at 20% 80%, rgba(124, 58, 237, 0.05) 0%, transparent 40%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isFadingOut ? 'scale(1.03)' : 'scale(1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Top Skip Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '28px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'rgba(148, 163, 184, 0.6)',
          letterSpacing: '0.4px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
        }}
      >
        Click anywhere to skip
      </div>

      {/* Centerpiece Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          maxWidth: '460px',
          width: '90%',
          textAlign: 'center',
          animation: 'fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Glowing Knight Emblem */}
        <div
          style={{
            position: 'relative',
            width: '140px',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Ambient Glow Halo */}
          <div
            style={{
              position: 'absolute',
              inset: '-20px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(200, 170, 110, 0.25) 0%, transparent 70%)',
              animation: 'pulseAura 3s ease-in-out infinite alternate',
            }}
          />

          <img
            src="/icons/icon-512x512.png"
            alt="Chessley Master Emblem"
            width={130}
            height={130}
            style={{
              objectFit: 'contain',
              borderRadius: '32px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8), 0 0 24px rgba(200, 170, 110, 0.25)',
              border: '1px solid rgba(200, 170, 110, 0.35)',
              zIndex: 2,
            }}
          />
        </div>

        {/* Brand Typography */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 800,
              letterSpacing: '5px',
              textTransform: 'uppercase',
              margin: 0,
              fontFamily: "'Inter', sans-serif",
              background: 'linear-gradient(180deg, #ffffff 10%, #dcdfe5 60%, #c8aa6e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 20px rgba(200, 170, 110, 0.2)',
            }}
          >
            CHESSLEY
          </h1>

          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
            }}
          >
            Precision Stockfish 19 Workstation
          </div>
        </div>

        {/* Loading Progress Bar & Status */}
        <div style={{ width: '100%', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              borderRadius: '2px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #c8aa6e, #f1f5f9)',
                borderRadius: '2px',
                boxShadow: '0 0 10px rgba(200, 170, 110, 0.6)',
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
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
        @keyframes pulseAura {
          0% { transform: scale(0.95); opacity: 0.6; }
          100% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
