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

      // Collect all distinct FEN positions needed
      // Position 0 is initial position before move 1
      const fens: string[] = [game.moves[0]?.fenBefore || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'];
      for (const m of game.moves) {
        fens.push(m.fenAfter);
      }

      const totalPositions = fens.length;
      let completedPositions = 0;

      // PASS 1: Fast Scan (depth 12)
      // Analyzes all positions in order, checking cache first
      for (let i = 0; i < totalPositions; i++) {
        if (signal.aborted) break;
        while (this.isPaused) {
          if (signal.aborted) break;
          await new Promise((r) => setTimeout(r, 100));
        }

        const fen = fens[i];
        let evalResult = await this.cache.get(fen, 12);

        if (!evalResult) {
          evalResult = await this.engineManager.analyzeBackground(fen, {
            depth: 12,
            timeMs: 250,
            signal,
          });
          await this.cache.set(fen, 12, evalResult);
        }

        this.positionEvaluations.set(fen, evalResult);
        completedPositions++;

        // If this is ply >= 1, we can now compute the MoveAnalysis for ply i
        if (i >= 1) {
          const prevFen = fens[i - 1];
          const evalBefore = this.positionEvaluations.get(prevFen);
          const evalAfter = evalResult;

          if (evalBefore && evalAfter) {
            const moveAnalysis = GameAnalyzer.evaluateMove(game, i, evalBefore, evalAfter);
            this.analyses[i] = moveAnalysis;
            this.callbacks.onPlyComplete?.(i, moveAnalysis);
          }
        }

        const pct = Math.round((completedPositions / (totalPositions * 1.5)) * 100);
        this.callbacks.onProgress?.(completedPositions, totalPositions, pct);
      }

      // PASS 2: Deep Refinement (depth 18) on Critical Positions
      // Re-evaluates blunders, mistakes, and sharp swings at deeper depth
      if (!signal.aborted) {
        const criticalPlies = Object.values(this.analyses)
          .filter((a) => a.classification === 'blunder' || a.classification === 'mistake' || a.classification === 'missed_win')
          .map((a) => a.ply);

        for (const ply of criticalPlies) {
          if (signal.aborted) break;
          const move = game.moves[ply - 1];
          if (!move) continue;

          // Deep evaluate before position
          let deepBefore = await this.cache.get(move.fenBefore, 18);
          if (!deepBefore) {
            deepBefore = await this.engineManager.analyzeBackground(move.fenBefore, {
              depth: 18,
              timeMs: 800,
              signal,
            });
            await this.cache.set(move.fenBefore, 18, deepBefore);
          }

          // Deep evaluate after position
          let deepAfter = await this.cache.get(move.fenAfter, 18);
          if (!deepAfter) {
            deepAfter = await this.engineManager.analyzeBackground(move.fenAfter, {
              depth: 18,
              timeMs: 800,
              signal,
            });
            await this.cache.set(move.fenAfter, 18, deepAfter);
          }

          const refined = GameAnalyzer.evaluateMove(game, ply, deepBefore, deepAfter);
          this.analyses[ply] = refined;
          this.callbacks.onPlyComplete?.(ply, refined);
        }
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
