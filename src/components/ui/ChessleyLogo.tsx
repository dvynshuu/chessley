import React from 'react';

interface ChessleyLogoProps {
  size?: number;
  withWordmark?: boolean;
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ChessleyLogo: React.FC<ChessleyLogoProps> = ({
  size = 36,
  withWordmark = false,
  subtitle,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`chessley-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: withWordmark ? Math.max(8, Math.round(size * 0.28)) : 0,
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Luxury Knight Emblem Tile */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size * 0.26)}px`,
          background: 'linear-gradient(145deg, #10141d, #060911)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: `0 ${Math.max(2, Math.round(size * 0.08))}px ${Math.max(6, Math.round(size * 0.25))}px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(200, 170, 110, 0.25), 0 0 ${Math.max(4, Math.round(size * 0.2))}px rgba(200, 170, 110, 0.15)`,
          border: '1px solid rgba(200, 170, 110, 0.25)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Subtle warm center radial sheen */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 50% 40%, rgba(200, 170, 110, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* High-res Knight Emblem */}
        <img
          src="/icons/icon-192x192.png"
          alt="Chessley Logo"
          width={Math.round(size * 0.94)}
          height={Math.round(size * 0.94)}
          style={{
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
            transform: 'scale(1.02)',
            zIndex: 1,
          }}
          loading="eager"
        />
      </div>

      {/* Optional Wordmark */}
      {withWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: `${Math.max(15, Math.round(size * 0.48))}px`,
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-0.2px',
                fontFamily: "'Inter', sans-serif",
                background: 'linear-gradient(180deg, #ffffff 30%, #e2e8f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Chessley
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(200, 170, 110, 0.12)',
                color: '#c8aa6e',
                border: '1px solid rgba(200, 170, 110, 0.35)',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              v2.0 MAX
            </span>
          </div>

          <div
            style={{
              fontSize: `${Math.max(10, Math.round(size * 0.28))}px`,
              color: '#94a3b8',
              letterSpacing: '0.2px',
              marginTop: '2px',
            }}
          >
            {subtitle || 'Precision Multi-Core Workstation'}
          </div>
        </div>
      )}
    </div>
  );
};
