import { ChessGame, MoveAnalysis, GameSummary } from '../chess/types';
import { EngineManager } from '../engine/stockfish/EngineManager';
import { AnalysisCache } from './AnalysisCache';
import { GameAnalyzer } from './GameAnalyzer';
import { EngineAnalysisResult } from '../engine/stockfish/EngineTypes';

export interface SchedulerCallbacks {
  onPlyComplete?: (ply: number, analysis: MoveAnalysis) => void;
  onProgress?: (completed: number, total: number, percentage: number) => void;
  onComplete?: (summary: GameSummary) => void;
  onError?: (err: Error) => void;
}

export class AnalysisScheduler {
  private static instance: AnalysisScheduler | null = null;
  private engineManager = EngineManager.getInstance();
  private cache = AnalysisCache.getInstance();

  private isRunning = false;
  private isPaused = false;
  private abortController: AbortController | null = null;

  private currentGame: ChessGame | null = null;
  private analyses: Record<number, MoveAnalysis> = {};
  private positionEvaluations: Map<string, EngineAnalysisResult> = new Map();

  private callbacks: SchedulerCallbacks = {};

  public static getInstance(): AnalysisScheduler {
    if (!AnalysisScheduler.instance) {
      AnalysisScheduler.instance = new AnalysisScheduler();
    }
    return AnalysisScheduler.instance;
  }

  public getAnalyses(): Record<number, MoveAnalysis> {
    return { ...this.analyses };
  }

  public getSummary(): GameSummary | null {
    if (!this.currentGame) return null;
    return GameAnalyzer.computeSummary(this.currentGame, this.analyses);
  }

  public get active(): boolean {
    return this.isRunning;
  }

  /**
   * Starts whole-game analysis.
   */
  public async startAnalysis(game: ChessGame, callbacks: SchedulerCallbacks = {}): Promise<void> {
    this.stop(); // Stop any ongoing analysis

    this.currentGame = game;
    this.analyses = {};
    this.positionEvaluations = new Map();
    this.callbacks = callbacks;
    this.isRunning = true;
    this.isPaused = false;
    this.abortController = new AbortController();

    const signal = this.abortController.signal;

    try {
      await this.engineManager.initialize();
      await this.engineManager.newGame();

      const config = this.engineManager.getConfig();
      
      // Determine adaptive depths for Pass 1 and Pass 2
      let pass1Depth = 12;
      let pass1TimeMs = 250;
      let pass2Depth = 18;
      let pass2TimeMs = 800;

      if (config.mode === 'max') {
        pass1Depth = 14;
        pass1TimeMs = 350;
        pass2Depth = Math.max(24, config.depth);
        pass2TimeMs = 2000;
      } else if (config.mode === 'deep') {
        pass1Depth = 14;
        pass1TimeMs = 300;
        pass2Depth = 20;
        pass2TimeMs = 1200;
      } else if (config.mode === 'fast') {
        pass1Depth = 10;
        pass1TimeMs = 150;
        pass2Depth = 14;
        pass2TimeMs = 400;
      } else if (config.mode === 'custom') {
        pass1Depth = Math.max(10, Math.floor(config.depth * 0.7));
        pass1TimeMs = Math.floor((config.timeLimitMs || 1000) * 0.4);
        pass2Depth = config.depth;
        pass2TimeMs = config.timeLimitMs || 1000;
      }

      // Collect all FEN positions in game order
      // Position 0 is initial position before move 1
      const fens: string[] = [game.moves[0]?.fenBefore || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'];
      for (const m of game.moves) {
        fens.push(m.fenAfter);
      }

      const totalPositions = fens.length;
      let completedPositions = 0;

      // Deduplicate unique FENs for optimal engine efficiency
      const uniqueFens = Array.from(new Set(fens));
      const concurrency = Math.min(3, Math.max(2, this.engineManager.getWorkerCount() - 1));

      // Helper: try completing any plies that have both before and after evals ready
      const checkAndCompletePlies = () => {
        for (let i = 1; i <= game.moves.length; i++) {
          if (this.analyses[i]) continue;
          const prevFen = fens[i - 1];
          const currFen = fens[i];
          const evalBefore = this.positionEvaluations.get(prevFen);
          const evalAfter = this.positionEvaluations.get(currFen);

          if (evalBefore && evalAfter) {
            const moveAnalysis = GameAnalyzer.evaluateMove(game, i, evalBefore, evalAfter);
            this.analyses[i] = moveAnalysis;
            this.callbacks.onPlyComplete?.(i, moveAnalysis);
          }
        }
      };

      // PASS 1: Parallel Fast Scan across unique FEN positions
      let fenIdx = 0;
      const runWorkerPass1 = async () => {
        while (fenIdx < uniqueFens.length) {
          if (signal.aborted) break;
          while (this.isPaused) {
            if (signal.aborted) break;
            await new Promise((r) => setTimeout(r, 100));
          }

          const currentIdx = fenIdx++;
          if (currentIdx >= uniqueFens.length) break;
          const fen = uniqueFens[currentIdx];

          let evalResult = await this.cache.get(fen, pass1Depth);
          if (!evalResult) {
            evalResult = await this.engineManager.analyzeBackground(fen, {
              depth: pass1Depth,
              timeMs: pass1TimeMs,
              signal,
            });
            await this.cache.set(fen, pass1Depth, evalResult);
          }

          this.positionEvaluations.set(fen, evalResult);
          completedPositions++;

          checkAndCompletePlies();

          const pct = Math.round((completedPositions / (totalPositions * 1.5)) * 100);
          this.callbacks.onProgress?.(completedPositions, totalPositions, pct);
        }
      };

      // Run parallel batch workers for Pass 1
      const pass1Workers = Array.from({ length: concurrency }, () => runWorkerPass1());
      await Promise.all(pass1Workers);

      // Final check for any remaining plies from Pass 1
      checkAndCompletePlies();

      // PASS 2: Parallel Deep Refinement on Critical Positions
      // Re-evaluates blunders, mistakes, and missed wins with deep tactical search
      if (!signal.aborted) {
        const criticalPlies = Object.values(this.analyses)
          .filter((a) => a.classification === 'blunder' || a.classification === 'mistake' || a.classification === 'missed_win')
          .map((a) => a.ply);

        let criticalIdx = 0;
        const runWorkerPass2 = async () => {
          while (criticalIdx < criticalPlies.length) {
            if (signal.aborted) break;
            while (this.isPaused) {
              if (signal.aborted) break;
              await new Promise((r) => setTimeout(r, 100));
            }

            const currentCritIdx = criticalIdx++;
            if (currentCritIdx >= criticalPlies.length) break;
            const ply = criticalPlies[currentCritIdx];
            const move = game.moves[ply - 1];
            if (!move) continue;

            // Deep evaluate before position
            let deepBefore = await this.cache.get(move.fenBefore, pass2Depth);
            if (!deepBefore) {
              deepBefore = await this.engineManager.analyzeBackground(move.fenBefore, {
                depth: pass2Depth,
                timeMs: pass2TimeMs,
                signal,
              });
              await this.cache.set(move.fenBefore, pass2Depth, deepBefore);
            }

            // Deep evaluate after position
            let deepAfter = await this.cache.get(move.fenAfter, pass2Depth);
            if (!deepAfter) {
              deepAfter = await this.engineManager.analyzeBackground(move.fenAfter, {
                depth: pass2Depth,
                timeMs: pass2TimeMs,
                signal,
              });
              await this.cache.set(move.fenAfter, pass2Depth, deepAfter);
            }

            const refined = GameAnalyzer.evaluateMove(game, ply, deepBefore, deepAfter);
            this.analyses[ply] = refined;
            this.callbacks.onPlyComplete?.(ply, refined);
          }
        };

        const pass2Workers = Array.from({ length: concurrency }, () => runWorkerPass2());
        await Promise.all(pass2Workers);
      }

      if (!signal.aborted) {
        this.callbacks.onProgress?.(totalPositions, totalPositions, 100);
        const summary = GameAnalyzer.computeSummary(game, this.analyses);
        this.callbacks.onComplete?.(summary);
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('[AnalysisScheduler Error]:', err);
        this.callbacks.onError?.(err);
      }
    } finally {
      this.isRunning = false;
      this.isPaused = false;
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public stop(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isRunning = false;
    this.isPaused = false;
  }
}
