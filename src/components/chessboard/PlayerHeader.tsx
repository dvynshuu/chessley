import React from 'react';
import { Player, PieceColor } from '../../chess/types';

interface PlayerHeaderProps {
  player: Player;
  color: PieceColor;
  isTurn: boolean;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  player,
  color,
  isTurn,
}) => {
  const isWhite = color === 'w';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        backgroundColor: isTurn ? 'rgba(30, 41, 59, 0.75)' : 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '10px',
        border: isTurn ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isTurn
          ? '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(56, 189, 248, 0.2)'
          : '0 4px 12px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '640px',
        transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, overflow: 'hidden' }}>
        <div
          aria-hidden="true"
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: isWhite ? '#f8fafc' : '#0f172a',
            border: isWhite ? '2px solid #94a3b8' : '2px solid #475569',
            boxShadow: isWhite ? '0 0 8px rgba(255, 255, 255, 0.4)' : 'inset 0 0 4px rgba(0, 0, 0, 0.8)',
            flexShrink: 0,
          }}
        />
        {player.title && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#e11d48',
              color: '#ffffff',
              padding: '1px 5px',
              borderRadius: '4px',
              letterSpacing: '0.4px',
              flexShrink: 0,
            }}
          >
            {player.title}
          </span>
        )}
        <span
          style={{
            fontSize: '13px',
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '-0.2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          {player.name}
        </span>
        {player.rating && (
          <span
            className="tabular-nums"
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            ({player.rating})
          </span>
        )}
      </div>

      {isTurn && (
        <span
          aria-live="polite"
          style={{
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            padding: '2px 8px',
            borderRadius: '12px',
            letterSpacing: '0.5px',
            boxShadow: '0 0 8px rgba(56, 189, 248, 0.3)',
            flexShrink: 0,
            marginLeft: '8px',
          }}
        >
          To Move
        </span>
      )}
    </div>
  );
};
