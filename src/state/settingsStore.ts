import { create } from 'zustand';
import { EngineMode, ENGINE_PRESETS } from '../engine/stockfish/EngineTypes';
import { EngineManager } from '../engine/stockfish/EngineManager';

export type BoardTheme = 'tournament' | 'dark' | 'glass' | 'wood' | 'midnight';

interface SettingsState {
  engineMode: EngineMode;
  depth: number;
  hash: number;
  multiPv: number;
  soundEnabled: boolean;
  soundVolume: number;
  showArrows: boolean;
  boardTheme: BoardTheme;

  // Actions
  setEngineMode: (mode: EngineMode) => void;
  setDepth: (depth: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setShowArrows: (show: boolean) => void;
  setBoardTheme: (theme: BoardTheme) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  engineMode: 'max',
  depth: 24,
  hash: 128,
  multiPv: 1,
  soundEnabled: true,
  soundVolume: 0.6,
  showArrows: true,
  boardTheme: 'dark',

  setEngineMode: (mode: EngineMode) => {
    const preset = ENGINE_PRESETS[mode];
    set({
      engineMode: mode,
      depth: preset.depth,
      hash: preset.hash,
      multiPv: preset.multiPv,
    });
    EngineManager.getInstance().setMode(mode);
  },

  setDepth: (depth: number) => {
    set({ depth, engineMode: 'custom' });
    EngineManager.getInstance().setMode('custom', { depth });
  },

  setSoundEnabled: (soundEnabled: boolean) => set({ soundEnabled }),
  setSoundVolume: (soundVolume: number) => set({ soundVolume }),
  setShowArrows: (showArrows: boolean) => set({ showArrows }),
  setBoardTheme: (boardTheme: BoardTheme) => set({ boardTheme }),
}));
