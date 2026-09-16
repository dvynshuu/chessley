import { EngineScore, PieceColor } from '../../chess/types';
export type { EngineScore };

export type EngineMode = 'fast' | 'balanced' | 'deep' | 'custom';

export interface EngineConfig {
  mode: EngineMode;
  depth: number;
  timeLimitMs?: number;
  multiPv: number;
  hash: number;
}

export const ENGINE_PRESETS: Record<EngineMode, EngineConfig> = {
  fast: {
    mode: 'fast',
    depth: 12,
    timeLimitMs: 250,
    multiPv: 1,
    hash: 16,
  },
  balanced: {
    mode: 'balanced',
    depth: 16,
    timeLimitMs: 600,
    multiPv: 1,
    hash: 32,
  },
  deep: {
    mode: 'deep',
    depth: 20,
    timeLimitMs: 1500,
    multiPv: 1,
    hash: 64,
  },
  custom: {
    mode: 'custom',
    depth: 18,
    timeLimitMs: 1000,
    multiPv: 1,
    hash: 32,
  },
};

export interface EngineInfo {
  depth: number;
  seldepth?: number;
  multipv: number;
  score: EngineScore;
  nodes?: number;
  nps?: number;
  hashfull?: number;
  time?: number;
  pv: string[];
}

export interface EngineAnalysisResult {
  fen: string;
  sideToMove: PieceColor;
  bestMove: string; // UCI format e.g. "e2e4"
  ponder?: string;
  score: EngineScore; // Raw score from engine (perspective of side to move)
  normalizedScore: EngineScore; // White's perspective
  depth: number;
  nodes?: number;
  nps?: number;
  timeMs?: number;
  principalVariation: string[];
  multiPvLines: EngineInfo[];
}
