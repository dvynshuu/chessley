import { create } from 'zustand';
import { ChessGame, GameSummary, MoveAnalysis } from '../chess/types';
import { EngineAnalysisResult, EngineInfo } from '../engine/stockfish/EngineTypes';
import { AnalysisScheduler } from '../analysis/AnalysisScheduler';
import { EngineManager } from '../engine/stockfish/EngineManager';
import { AnalysisCache } from '../analysis/AnalysisCache';

export type AnalysisGlobalStatus = 'idle' | 'analyzing' | 'paused' | 'complete' | 'error';

interface AnalysisState {
  status: AnalysisGlobalStatus;
  progressPercent: number;
  completedPlies: number;
  totalPlies: number;
  analyses: Record<number, MoveAnalysis>;
  summary: GameSummary | null;
  error: string | null;

  // Real-time evaluation of current board position
  interactiveResult: EngineAnalysisResult | null;
  interactiveInfo: EngineInfo | null;
  isInteractiveEvaluating: boolean;

  // Actions
  startWholeGameAnalysis: (game: ChessGame) => Promise<void>;
  pauseAnalysis: () => void;
  resumeAnalysis: () => void;
  stopAnalysis: () => void;
  evaluateCurrentPosition: (fen: string, depth?: number) => Promise<void>;
  clearAnalysis: () => void;
}

const scheduler = AnalysisScheduler.getInstance();
const engineManager = EngineManager.getInstance();
const cache = AnalysisCache.getInstance();

export const useAnalysisStore = create<AnalysisState>((set) => ({
  status: 'idle',
  progressPercent: 0,
  completedPlies: 0,
  totalPlies: 0,
  analyses: {},
  summary: null,
  error: null,

  interactiveResult: null,
  interactiveInfo: null,
  isInteractiveEvaluating: false,

  startWholeGameAnalysis: async (game: ChessGame) => {
    set({
      status: 'analyzing',
      progressPercent: 0,
      completedPlies: 0,
      totalPlies: game.moves.length,
      analyses: {},
      summary: null,
      error: null,
    });

    try {
      await scheduler.startAnalysis(game, {
        onPlyComplete: (ply, analysis) => {
          set((state) => ({
            analyses: {
              ...state.analyses,
              [ply]: analysis,
            },
          }));
        },
        onProgress: (completed, total, percentage) => {
          set({
            completedPlies: completed,
            totalPlies: total,
            progressPercent: percentage,
          });
        },
        onComplete: (summary) => {
          set({
            status: 'complete',
            progressPercent: 100,
            summary,
          });
        },
        onError: (err) => {
          set({
            status: 'error',
            error: err.message,
          });
        },
      });
    } catch (err: any) {
      set({ status: 'error', error: err.message });
    }
  },

  pauseAnalysis: () => {
    scheduler.pause();
    set({ status: 'paused' });
  },

  resumeAnalysis: () => {
    scheduler.resume();
    set({ status: 'analyzing' });
  },

  stopAnalysis: () => {
    scheduler.stop();
    set({ status: 'idle' });
  },

  evaluateCurrentPosition: async (fen: string, depth = 16) => {
    // 1. Check cache first for instant 0ms response
    const cached = await cache.get(fen, depth);
    if (cached) {
      set({
        interactiveResult: cached,
        interactiveInfo: cached.multiPvLines[0] || null,
        isInteractiveEvaluating: false,
      });
      return;
    }

    set({ isInteractiveEvaluating: true });

    try {
      const result = await engineManager.analyzeInteractive(fen, {
        depth,
        onInfo: (info) => {
          set({ interactiveInfo: info });
        },
      });

      await cache.set(fen, depth, result);

      set({
        interactiveResult: result,
        interactiveInfo: result.multiPvLines[0] || null,
        isInteractiveEvaluating: false,
      });
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('[Interactive Engine Evaluation Error]:', err);
        set({ isInteractiveEvaluating: false });
      }
    }
  },

  clearAnalysis: () => {
    scheduler.stop();
    set({
      status: 'idle',
      progressPercent: 0,
      completedPlies: 0,
      totalPlies: 0,
      analyses: {},
      summary: null,
      error: null,
      interactiveResult: null,
      interactiveInfo: null,
      isInteractiveEvaluating: false,
    });
  },
}));
