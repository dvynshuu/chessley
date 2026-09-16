import { StockfishClient } from './StockfishClient';
import { EngineConfig, ENGINE_PRESETS, EngineMode, EngineAnalysisResult, EngineInfo } from './EngineTypes';

export class EngineManager {
  private static instance: EngineManager | null = null;
  private client: StockfishClient;
  private currentConfig: EngineConfig = ENGINE_PRESETS.balanced;
  private activeAbortController: AbortController | null = null;
  private isInitializing = false;

  private constructor() {
    this.client = new StockfishClient();
  }

  public static getInstance(): EngineManager {
    if (!EngineManager.instance) {
      EngineManager.instance = new EngineManager();
    }
    return EngineManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;
    try {
      await this.client.init();
      await this.client.applyConfig(this.currentConfig);
    } finally {
      this.isInitializing = false;
    }
  }

  public async setMode(mode: EngineMode, customConfig?: Partial<EngineConfig>): Promise<void> {
    const base = ENGINE_PRESETS[mode];
    this.currentConfig = {
      ...base,
      ...customConfig,
    };
    await this.client.applyConfig(this.currentConfig);
  }

  public getConfig(): EngineConfig {
    return { ...this.currentConfig };
  }

  /**
   * Analyzes a position with cancellation of any existing active interactive request.
   */
  public async analyzeInteractive(
    fen: string,
    options: {
      depth?: number;
      timeMs?: number;
      multiPv?: number;
      onInfo?: (info: EngineInfo) => void;
    } = {}
  ): Promise<EngineAnalysisResult> {
    // Abort previous interactive request if running
    if (this.activeAbortController) {
      this.activeAbortController.abort();
    }

    this.activeAbortController = new AbortController();
    const signal = this.activeAbortController.signal;

    try {
      return await this.client.analyzePosition(fen, {
        depth: options.depth || this.currentConfig.depth,
        timeMs: options.timeMs || this.currentConfig.timeLimitMs,
        multiPv: options.multiPv || this.currentConfig.multiPv,
        onInfo: options.onInfo,
        signal,
      });
    } finally {
      if (this.activeAbortController?.signal === signal) {
        this.activeAbortController = null;
      }
    }
  }

  /**
   * Analyzes a position as part of background queue (allows external AbortSignal).
   */
  public async analyzeBackground(
    fen: string,
    options: {
      depth?: number;
      timeMs?: number;
      multiPv?: number;
      onInfo?: (info: EngineInfo) => void;
      signal?: AbortSignal;
    } = {}
  ): Promise<EngineAnalysisResult> {
    return await this.client.analyzePosition(fen, {
      depth: options.depth || this.currentConfig.depth,
      timeMs: options.timeMs,
      multiPv: options.multiPv || 1,
      onInfo: options.onInfo,
      signal: options.signal,
    });
  }

  public stop(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
    this.client.stop();
  }

  public destroy(): void {
    this.stop();
    this.client.destroy();
    EngineManager.instance = null;
  }
}
