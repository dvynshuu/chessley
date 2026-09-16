import { create } from 'zustand';
import { ChessGame, PieceColor } from '../chess/types';
import { ChessGameModel } from '../chess/ChessGame';

interface GameState {
  game: ChessGame;
  currentPly: number;
  orientation: PieceColor;
  model: ChessGameModel;

  // Actions
  loadGame: (pgnOrGame: string | ChessGame, source?: 'chesscom' | 'pgn' | 'manual') => void;
  setCurrentPly: (ply: number) => void;
  nextMove: () => void;
  prevMove: () => void;
  firstMove: () => void;
  lastMove: () => void;
  flipBoard: () => void;
  setOrientation: (color: PieceColor) => void;
}

const defaultModel = new ChessGameModel();

export const useGameStore = create<GameState>((set, get) => ({
  game: defaultModel.game,
  currentPly: 0,
  orientation: 'w',
  model: defaultModel,

  loadGame: (pgnOrGame, source = 'pgn') => {
    const model = new ChessGameModel(
      typeof pgnOrGame === 'string'
        ? ChessGameModel.parsePgn(pgnOrGame, source)
        : pgnOrGame
    );
    set({
      game: model.game,
      model,
      currentPly: 0,
      orientation: 'w',
    });
  },

  setCurrentPly: (ply: number) => {
    const total = get().game.moves.length;
    const clamped = Math.max(0, Math.min(ply, total));
    set({ currentPly: clamped });
  },

  nextMove: () => {
    const { currentPly, game } = get();
    if (currentPly < game.moves.length) {
      set({ currentPly: currentPly + 1 });
    }
  },

  prevMove: () => {
    const { currentPly } = get();
    if (currentPly > 0) {
      set({ currentPly: currentPly - 1 });
    }
  },

  firstMove: () => {
    set({ currentPly: 0 });
  },

  lastMove: () => {
    const total = get().game.moves.length;
    set({ currentPly: total });
  },

  flipBoard: () => {
    set((state) => ({ orientation: state.orientation === 'w' ? 'b' : 'w' }));
  },

  setOrientation: (orientation: PieceColor) => {
    set({ orientation });
  },
}));
