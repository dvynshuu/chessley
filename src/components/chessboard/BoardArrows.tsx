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
        {arrows.map((arr, i) => (
          <marker
            key={`marker_${i}`}
            id={`arrowhead_${i}`}
            markerWidth="5"
            markerHeight="5"
            refX="3.2"
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

        const shorten = 3.5;
        const endX = p2.x - (dx / dist) * shorten;
        const endY = p2.y - (dy / dist) * shorten;

        return (
          <g key={`arrow_${i}`} opacity={arr.opacity ?? 0.85}>
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
