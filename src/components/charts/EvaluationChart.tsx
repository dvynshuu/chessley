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
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const totalPlies = game.moves.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      setDimensions((prev) => {
        if (prev.width === rect.width && prev.height === rect.height) return prev;
        return { width: rect.width, height: rect.height };
      });
    };

    updateDimensions();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => updateDimensions());
      ro.observe(canvas);
    }

    window.addEventListener('resize', updateDimensions);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || dimensions.width;
    const height = rect.height || dimensions.height;

    if (width <= 0 || height <= 0) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

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

    // Helper to draw smooth bezier curve across points
    const drawSmoothPath = (pts: Array<{ x: number; y: number }>, startWithLineTo = false) => {
      if (pts.length < 2) return;
      if (startWithLineTo) {
        ctx.lineTo(pts[0].x, pts[0].y);
      } else {
        ctx.moveTo(pts[0].x, pts[0].y);
      }
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = i > 0 ? pts[i - 1] : pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
    };

    // 1. Draw horizontal equality line (0.00)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw Area fill for White (above midY)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, midY);
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(points[0].x, midY);
    drawSmoothPath(points, true);
    ctx.lineTo(points[points.length - 1].x, midY);
    ctx.closePath();
    const whiteGrad = ctx.createLinearGradient(0, 0, 0, midY);
    whiteGrad.addColorStop(0, 'rgba(248, 250, 252, 0.22)');
    whiteGrad.addColorStop(1, 'rgba(248, 250, 252, 0.02)');
    ctx.fillStyle = whiteGrad;
    ctx.fill();
    ctx.restore();

    // 3. Draw Area fill for Black (below midY)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, midY, width, height - midY);
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(points[0].x, midY);
    drawSmoothPath(points, true);
    ctx.lineTo(points[points.length - 1].x, midY);
    ctx.closePath();
    const blackGrad = ctx.createLinearGradient(0, midY, 0, height);
    blackGrad.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
    blackGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = blackGrad;
    ctx.fill();
    ctx.restore();

    // 4. Draw Main Evaluation Spline Curve (Crisp Architectural Precision)
    ctx.beginPath();
    drawSmoothPath(points, false);
    ctx.strokeStyle = '#c8aa6e';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 5. Draw Move Classification Quality Dots
    for (const pt of points) {
      if (!pt.analysis) continue;
      const c = pt.analysis.classification;
      if (c === 'blunder' || c === 'mistake' || c === 'brilliant' || c === 'missed_win') {
        const isMajor = c === 'blunder' || c === 'brilliant';
        const color =
          c === 'blunder'
            ? '#ef4444'
            : c === 'missed_win'
            ? '#e11d48'
            : c === 'mistake'
            ? '#f97316'
            : '#10b981';

        // Outer dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isMajor ? 4 : 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#0f121a';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // 6. Current Ply Indicator line
    if (currentPly >= 0 && currentPly <= totalPlies) {
      const curX = (currentPly / totalPlies) * width;
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(curX, 0);
      ctx.lineTo(curX, height);
      ctx.stroke();

      // Precision cursor head
      ctx.fillStyle = '#c8aa6e';
      ctx.beginPath();
      ctx.arc(curX, midY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, [game, analyses, currentPly, totalPlies, dimensions]);

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

  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || totalPlies === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return;
    const x = Math.max(0, Math.min(rect.width, touch.clientX - rect.left));
    const ply = Math.round((x / rect.width) * totalPlies);
    setHoverPly(ply);
    onSelectPly(ply);
  };

  const hoverAnalysis = hoverPly ? analyses[hoverPly] : null;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          width: '100%',
          height: '96px',
          backgroundColor: '#0f121a',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          cursor: 'crosshair',
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="slider"
          aria-label="Evaluation flow chart"
          aria-valuemin={0}
          aria-valuemax={totalPlies}
          aria-valuenow={currentPly}
          aria-valuetext={currentPly === 0 ? 'Start position' : `Ply ${currentPly}`}
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
          onTouchEnd={() => setHoverPly(null)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              onSelectPly(Math.max(0, currentPly - 1));
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              onSelectPly(Math.min(totalPlies, currentPly + 1));
            } else if (e.key === 'Home') {
              e.preventDefault();
              onSelectPly(0);
            } else if (e.key === 'End') {
              e.preventDefault();
              onSelectPly(totalPlies);
            }
          }}
        />

        {/* Floating Workstation Hover Tooltip */}
        {hoverPly !== null && (
          <div
            className="tabular-nums"
            style={{
              position: 'absolute',
              top: '6px',
              left: `${Math.min(85, Math.max(15, (hoverPly / totalPlies) * 100))}%`,
              transform: 'translateX(-50%)',
              backgroundColor: '#151923',
              border: '1px solid rgba(200, 170, 110, 0.35)',
              borderRadius: '4px',
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#f8fafc',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {hoverPly === 0 ? (
              <span>Start (0.00)</span>
            ) : (
              <>
                <span style={{ color: '#94a3b8' }}>
                  {Math.floor((hoverPly - 1) / 2) + 1}
                  {hoverPly % 2 === 1 ? '.' : '…'}
                </span>
                {hoverAnalysis && (
                  <span style={{ color: '#ffffff', fontWeight: 800 }}>{hoverAnalysis.san}</span>
                )}
                <span style={{ color: '#c8aa6e' }}>
                  {hoverAnalysis ? formatScore(hoverAnalysis.playedScoreAfter) : '—'}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
