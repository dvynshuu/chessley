import React from 'react';
import { PieceColor } from '../../chess/types';

interface ArrowDef {
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

  const squareToCoords = (sq: string): { x: number; y: number } | null => {
    if (sq.length < 2) return null;
    const file = sq[0].toLowerCase();
    const rank = parseInt(sq[1], 10);
    if (isNaN(rank) || file < 'a' || file > 'h' || rank < 1 || rank > 8) return null;

    let fileIdx = file.charCodeAt(0) - 'a'.charCodeAt(0);
    let rankIdx = 8 - rank; // 0 at rank 8, 7 at rank 1

    if (orientation === 'b') {
      fileIdx = 7 - fileIdx;
      rankIdx = rank - 1;
    }

    return {
      x: fileIdx * 12.5 + 6.25,
      y: rankIdx * 12.5 + 6.25,
    };
  };

  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <defs>
        {/* Glow Filters */}
        <filter id="arrow-glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#10b981" floodOpacity="0.75" />
        </filter>
        <filter id="arrow-glow-red" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#ef4444" floodOpacity="0.75" />
        </filter>
        <filter id="arrow-glow-orange" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#f97316" floodOpacity="0.75" />
        </filter>

        {/* Gradients */}
        <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#f87171" />
        </linearGradient>
        <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>

        {arrows.map((arr, i) => {
          const isEmerald = arr.color.includes('10b981') || arr.color === '#10b981';
          const isRed = arr.color.includes('ef4444') || arr.color === '#ef4444';
          const fillColor = isEmerald ? 'url(#grad-emerald)' : isRed ? 'url(#grad-red)' : arr.color;

          return (
            <marker
              key={`marker_${i}`}
              id={`arrowhead_${i}`}
              markerWidth="6"
              markerHeight="6"
              refX="3.5"
              refY="3"
              orient="auto"
            >
              <polygon points="0 1, 5 3, 0 5" fill={fillColor} />
            </marker>
          );
        })}
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

        const isEmerald = arr.color.includes('10b981') || arr.color === '#10b981';
        const isRed = arr.color.includes('ef4444') || arr.color === '#ef4444';
        const strokeColor = isEmerald ? 'url(#grad-emerald)' : isRed ? 'url(#grad-red)' : arr.color;
        const filterId = isEmerald ? 'url(#arrow-glow-emerald)' : isRed ? 'url(#arrow-glow-red)' : undefined;

        return (
          <g key={`arrow_${i}`} opacity={arr.opacity ?? 0.9} filter={filterId}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={endX}
              y2={endY}
              stroke={strokeColor}
              strokeWidth={arr.width ?? 3.0}
              strokeLinecap="round"
              markerEnd={`url(#arrowhead_${i})`}
            />
          </g>
        );
      })}
    </svg>
  );
};
