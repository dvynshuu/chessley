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
        backgroundColor: isTurn ? '#151923' : '#0f121a',
        borderRadius: '8px',
        border: isTurn ? '1px solid rgba(200, 170, 110, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isTurn
          ? '0 2px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
          : '0 1px 3px rgba(0, 0, 0, 0.4)',
        width: '100%',
        maxWidth: '640px',
        transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, overflow: 'hidden' }}>
        <div
          aria-hidden="true"
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: isWhite ? '#f8fafc' : '#080a0f',
            border: isWhite ? '1.5px solid #cbd5e1' : '1.5px solid #475569',
            boxShadow: isWhite ? '0 1px 2px rgba(0, 0, 0, 0.4)' : 'inset 0 1px 2px rgba(0, 0, 0, 0.8)',
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
              borderRadius: '3px',
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
            fontWeight: 700,
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
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#c8aa6e',
            backgroundColor: 'rgba(200, 170, 110, 0.12)',
            border: '1px solid rgba(200, 170, 110, 0.3)',
            padding: '2px 7px',
            borderRadius: '4px',
            letterSpacing: '0.5px',
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
