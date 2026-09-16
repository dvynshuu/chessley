import React from 'react';
import { MoveClassification } from '../../chess/types';
import { CLASSIFICATION_META } from '../../chess/Classification';

interface SquareBadgeProps {
  classification: MoveClassification;
}

export const SquareBadge: React.FC<SquareBadgeProps> = ({ classification }) => {
  const meta = CLASSIFICATION_META[classification];
  if (!meta) return null;

  return (
    <div
      title={`${meta.name}: ${meta.description}`}
      style={{
        position: 'absolute',
        top: '2px',
        right: '2px',
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        backgroundColor: meta.color,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 800,
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.45)',
        zIndex: 15,
        userSelect: 'none',
        pointerEvents: 'auto',
        animation: 'badgePop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      {meta.symbol}
    </div>
  );
};
