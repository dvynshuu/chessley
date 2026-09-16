export type PieceColor = 'w' | 'b';

export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*';

export interface Player {
  name: string;
  rating?: number;
  title?: string;
  avatarUrl?: string;
}

export interface ChessMove {
  ply: number;
  moveNumber: number;
  color: PieceColor;
  san: string;
  uci: string;
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  fenBefore: string;
  fenAfter: string;
  comment?: string;
  clock?: string;
}

export interface ChessGame {
  id: string;
  white: Player;
  black: Player;
  result: GameResult;
  date?: string;
  timeControl?: string;
  eco?: string;
  opening?: string;
  pgn: string;
  moves: ChessMove[];
  source: 'chesscom' | 'pgn' | 'manual';
  metadata: Record<string, string>;
}

export type EngineScore =
  | { type: 'cp'; value: number }
  | { type: 'mate'; value: number };

export type MoveClassification =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'missed_win'
  | 'book';

export interface MoveAnalysis {
  ply: number;
  moveNumber: number;
  color: PieceColor;
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;

  // Evaluation before and after move (both in White's perspective)
  bestScoreBefore: EngineScore;
  playedScoreAfter: EngineScore;

  // Best move recommended by engine in fenBefore
  bestMove: string; // UCI format e.g. "e2e4"
  bestMoveSan?: string; // SAN format e.g. "e4"
  principalVariation: string[];

  // Mathematical loss in win-probability (0 to 100)
  winProbabilityBefore: number;
  winProbabilityAfter: number;
  winProbabilityLoss: number;
  moveAccuracy: number;

  classification: MoveClassification;

  depth: number;
  nodes?: number;
  timeMs?: number;
  analyzedAt: number;
  engineVersion: string;
}

export type AnalysisStatus = 'queued' | 'analyzing' | 'complete' | 'cached' | 'failed' | 'cancelled';

export interface PlyAnalysisState {
  status: AnalysisStatus;
  analysis?: MoveAnalysis;
  error?: string;
}

export interface GameSummary {
  whiteAccuracy: number;
  blackAccuracy: number;
  totalPlies: number;
  classificationCounts: {
    w: Record<MoveClassification, number>;
    b: Record<MoveClassification, number>;
  };
  openingAccuracy: { w: number; b: number };
  middlegameAccuracy: { w: number; b: number };
  endgameAccuracy: { w: number; b: number };
  criticalMoments: number[]; // ply indices
}
