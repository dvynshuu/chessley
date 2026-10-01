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
      {/* Precision Knight Emblem Tile */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size * 0.22)}px`,
          backgroundColor: '#0f121a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: `0 ${Math.max(1, Math.round(size * 0.05))}px ${Math.max(4, Math.round(size * 0.15))}px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
          border: '1px solid rgba(200, 170, 110, 0.3)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* High-res Knight Emblem */}
        <img
          src="/icons/icon-192x192.png"
          alt="Chessley Logo"
          width={Math.round(size * 0.9)}
          height={Math.round(size * 0.9)}
          style={{
            objectFit: 'contain',
            filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.6))',
            zIndex: 1,
          }}
          loading="eager"
        />
      </div>

      {/* Wordmark */}
      {withWordmark && (
        <div className="chessley-wordmark" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: `${Math.max(15, Math.round(size * 0.48))}px`,
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-0.3px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Chessley
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                padding: '2px 5px',
                borderRadius: '4px',
                backgroundColor: 'rgba(200, 170, 110, 0.1)',
                color: '#c8aa6e',
                border: '1px solid rgba(200, 170, 110, 0.3)',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              v2.0 MAX
            </span>
          </div>

          <div
            className="chessley-wordmark-subtitle"
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
