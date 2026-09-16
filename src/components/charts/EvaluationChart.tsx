import React, { useRef, useEffect, useState } from 'react';
import { ChessGame, MoveAnalysis } from '../../chess/types';
import { scoreToNumeric, formatScore } from '../../chess/EvaluationUtils';

interface EvaluationChartProps {
  game: ChessGame;
  analyses: Record<number, MoveAnalysis>;
  currentPly: number;
  onSelectPly: (ply: number) => void;
}

export const EvaluationChart: React.FC<EvaluationChartProps> = ({
  game,
  analyses,
  currentPly,
  onSelectPly,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverPly, setHoverPly] = useState<number | null>(null);

  const totalPlies = game.moves.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    if (totalPlies === 0) return;

    const midY = height / 2;
    const maxEvalCp = 600; // clamp at +/- 6.00 for clean visualization

    // Helper to map score to Y
    const scoreToY = (scoreCp: number): number => {
      const clamped = Math.max(-maxEvalCp, Math.min(maxEvalCp, scoreCp));
      // White is top (lower Y), Black is bottom (higher Y)
      return midY - (clamped / maxEvalCp) * (midY * 0.85);
    };

    // Calculate (x, y) coordinates for each ply from 0 to totalPlies
    const points: Array<{ x: number; y: number; ply: number; cp: number; analysis?: MoveAnalysis }> = [];

    // Starting position (ply 0, ~0.2 cp)
    points.push({
      x: 0,
      y: scoreToY(20),
      ply: 0,
      cp: 20,
    });

    for (let i = 1; i <= totalPlies; i++) {
      const x = (i / totalPlies) * width;
      const analysis = analyses[i];
      let cp = 0;
      if (analysis) {
        cp = scoreToNumeric(analysis.playedScoreAfter);
      } else {
        // Fallback to previous
        cp = points[points.length - 1].cp;
      }
      points.push({
        x,
        y: scoreToY(cp),
        ply: i,
        cp,
        analysis,
      });
    }

    // 1. Draw horizontal equality line (0.00)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw Area fill for White (above midY)
    ctx.beginPath();
    ctx.moveTo(points[0].x, midY);
    for (const pt of points) {
      ctx.lineTo(pt.x, Math.min(midY, pt.y));
    }
    ctx.lineTo(points[points.length - 1].x, midY);
    ctx.closePath();
    const whiteGrad = ctx.createLinearGradient(0, 0, 0, midY);
    whiteGrad.addColorStop(0, 'rgba(248, 250, 252, 0.45)');
    whiteGrad.addColorStop(1, 'rgba(248, 250, 252, 0.05)');
    ctx.fillStyle = whiteGrad;
    ctx.fill();

    // 3. Draw Area fill for Black (below midY)
    ctx.beginPath();
    ctx.moveTo(points[0].x, midY);
    for (const pt of points) {
      ctx.lineTo(pt.x, Math.max(midY, pt.y));
    }
    ctx.lineTo(points[points.length - 1].x, midY);
    ctx.closePath();
    const blackGrad = ctx.createLinearGradient(0, midY, 0, height);
    blackGrad.addColorStop(0, 'rgba(15, 23, 42, 0.1)');
    blackGrad.addColorStop(1, 'rgba(15, 23, 42, 0.6)');
    ctx.fillStyle = blackGrad;
    ctx.fill();

    // 4. Draw Main Evaluation Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // 5. Draw Blunder & Mistake Markers
    for (const pt of points) {
      if (!pt.analysis) continue;
      const c = pt.analysis.classification;
      if (c === 'blunder' || c === 'mistake' || c === 'brilliant' || c === 'missed_win') {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, c === 'blunder' || c === 'brilliant' ? 4.5 : 3.5, 0, Math.PI * 2);
        if (c === 'blunder') {
          ctx.fillStyle = '#ef4444';
        } else if (c === 'missed_win') {
          ctx.fillStyle = '#e11d48';
        } else if (c === 'mistake') {
          ctx.fillStyle = '#f97316';
        } else {
          ctx.fillStyle = '#00e5ff';
        }
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // 6. Current Ply Indicator line
    if (currentPly >= 0 && currentPly <= totalPlies) {
      const curX = (currentPly / totalPlies) * width;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(curX, 0);
      ctx.lineTo(curX, height);
      ctx.stroke();

      // Small cursor handle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(curX, midY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [game, analyses, currentPly, totalPlies]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || totalPlies === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ply = Math.round((x / rect.width) * totalPlies);
    setHoverPly(ply);
  };

  const handleMouseLeave = () => {
    setHoverPly(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || totalPlies === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ply = Math.round((x / rect.width) * totalPlies);
    onSelectPly(ply);
  };

  const hoverAnalysis = hoverPly ? analyses[hoverPly] : null;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          width: '100%',
          height: '90px',
          backgroundColor: '#0f172a',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          cursor: 'crosshair',
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />

        {/* Hover Tooltip */}
        {hoverPly !== null && (
          <div
            style={{
              position: 'absolute',
              top: '6px',
              left: `${Math.min(85, Math.max(15, (hoverPly / totalPlies) * 100))}%`,
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#f8fafc',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            {hoverPly === 0 ? (
              'Start (0.0)'
            ) : (
              <>
                Move {Math.floor((hoverPly - 1) / 2) + 1}
                {hoverPly % 2 === 1 ? '' : '... '}:{' '}
                {hoverAnalysis ? formatScore(hoverAnalysis.playedScoreAfter) : '—'}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
