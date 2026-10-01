import React from 'react';
import { PieceColor } from '../../chess/types';

export interface ArrowDef {
  from: string;
  to: string;
  color: string;
  opacity?: number;
  width?: number;
}

interface BoardArrowsProps {
  arrows: ArrowDef[];
  orientation: PieceColor;
}

export const BoardArrows: React.FC<BoardArrowsProps> = ({ arrows, orientation }) => {
  if (arrows.length === 0) return null;

  // Convert chess square (e.g. 'e4') to 0-100 viewBox percentages
  const squareToCoords = (square: string): { x: number; y: number } | null => {
    if (square.length < 2) return null;
    const file = square.charCodeAt(0) - 97; // 0 to 7 (a to h)
    const rank = parseInt(square[1], 10) - 1; // 0 to 7 (1 to 8)
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;

    const col = orientation === 'w' ? file : 7 - file;
    const row = orientation === 'w' ? 7 - rank : rank;

    const x = col * 12.5 + 6.25;
    const y = row * 12.5 + 6.25;

    return { x, y };
  };

  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <defs>
        {/* Crisp Physical Drop Shadow for Contrast without Radioactive Glow */}
        <filter id="arrow-tactile-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodColor="#000000" floodOpacity="0.65" />
        </filter>

        {arrows.map((arr, i) => (
          <marker
            key={`marker_${i}`}
            id={`arrowhead_${i}`}
            markerWidth="5"
            markerHeight="5"
            refX="3"
            refY="2.5"
            orient="auto"
          >
            <polygon points="0 0.8, 4.5 2.5, 0 4.2" fill={arr.color} />
          </marker>
        ))}
      </defs>

      {arrows.map((arr, i) => {
        const p1 = squareToCoords(arr.from);
        const p2 = squareToCoords(arr.to);
        if (!p1 || !p2) return null;

        // Calculate shortened endpoint so arrow tip stops cleanly before center of piece
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return null;

        const shorten = 3.6;
        const endX = p2.x - (dx / dist) * shorten;
        const endY = p2.y - (dy / dist) * shorten;

        return (
          <g key={`arrow_${i}`} opacity={arr.opacity ?? 0.88} filter="url(#arrow-tactile-shadow)">
            <line
              x1={p1.x}
              y1={p1.y}
              x2={endX}
              y2={endY}
              stroke={arr.color}
              strokeWidth={arr.width ?? 2.8}
              strokeLinecap="round"
              markerEnd={`url(#arrowhead_${i})`}
            />
          </g>
        );
      })}
    </svg>
  );
};
