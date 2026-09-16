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
        padding: '6px 12px',
        backgroundColor: '#0f172a',
        borderRadius: '6px',
        border: `1px solid ${isTurn ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
        width: '100%',
        maxWidth: '640px',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: isWhite ? '#ffffff' : '#0f172a',
            border: '2px solid #64748b',
          }}
        />
        {player.title && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#e11d48',
              color: '#ffffff',
              padding: '1px 4px',
              borderRadius: '3px',
            }}
          >
            {player.title}
          </span>
        )}
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
          {player.name}
        </span>
        {player.rating && (
          <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
            ({player.rating})
          </span>
        )}
      </div>

      {isTurn && (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#38bdf8',
            letterSpacing: '0.5px',
          }}
        >
          To Move
        </span>
      )}
    </div>
  );
};
