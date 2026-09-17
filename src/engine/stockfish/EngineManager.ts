import { StockfishClient } from './StockfishClient';
import { EngineConfig, ENGINE_PRESETS, EngineMode, EngineAnalysisResult, EngineInfo } from './EngineTypes';

export class EngineManager {
  private static instance: EngineManager | null = null;
  
  // Dedicated client for live UI exploration (never blocked by background jobs)
  private interactiveClient: StockfishClient;
  
  // Background worker pool for parallel whole-game analysis
  private backgroundPool: StockfishClient[] = [];
  private poolSize: number;
  private idleWorkers: StockfishClient[] = [];
  private waitQueue: Array<(worker: StockfishClient) => void> = [];

  private currentConfig: EngineConfig = ENGINE_PRESETS.balanced;
  private activeInteractiveAbortController: AbortController | null = null;
  private isInitializing = false;
  private isInitialized = false;

  private constructor() {
    this.interactiveClient = new StockfishClient();
    
    // Determine optimal worker pool size based on hardware concurrency
    const cores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;
    // Keep at least 2 workers, up to 3 background workers + 1 interactive = 4 cores utilized
    this.poolSize = Math.min(3, Math.max(2, Math.floor(cores / 2)));
    for (let i = 0; i < this.poolSize; i++) {
      this.backgroundPool.push(new StockfishClient());
    }
  }

  public static getInstance(): EngineManager {
    if (!EngineManager.instance) {
      EngineManager.instance = new EngineManager();
    }
    return EngineManager.instance;
  }

  public getWorkerCount(): number {
    return this.backgroundPool.length + 1; // background pool + 1 interactive
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) return;
    this.isInitializing = true;
    try {
      // Initialize interactive client and background pool in parallel
      const initPromises = [
        this.interactiveClient.init(),
        ...this.backgroundPool.map((worker) => worker.init()),
      ];
      await Promise.all(initPromises);
      this.idleWorkers = [...this.backgroundPool];
      this.isInitialized = true;
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

    const applyPromises = [
      this.interactiveClient.applyConfig(this.currentConfig),
      ...this.backgroundPool.map((worker) => worker.applyConfig(this.currentConfig)),
    ];
    await Promise.all(applyPromises);
  }

  public async newGame(): Promise<void> {
    const promises = [
      this.interactiveClient.newGame(),
      ...this.backgroundPool.map((worker) => worker.newGame()),
    ];
    await Promise.all(promises);
  }

  public getConfig(): EngineConfig {
    return { ...this.currentConfig };
  }

  /**
   * Analyzes a position with cancellation of any existing active interactive request.
   * Runs on the dedicated interactive worker with zero contention.
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
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Abort previous interactive request if running
    if (this.activeInteractiveAbortController) {
      this.activeInteractiveAbortController.abort();
    }

    this.activeInteractiveAbortController = new AbortController();
    const signal = this.activeInteractiveAbortController.signal;

    try {
      return await this.interactiveClient.analyzePosition(fen, {
        depth: options.depth || this.currentConfig.depth,
        timeMs: options.timeMs || this.currentConfig.timeLimitMs,
        multiPv: options.multiPv || this.currentConfig.multiPv,
        onInfo: options.onInfo,
        signal,
      });
    } finally {
      if (this.activeInteractiveAbortController?.signal === signal) {
        this.activeInteractiveAbortController = null;
      }
    }
  }

  /**
   * Acquires an idle background worker from the pool, waiting if all are busy.
   */
  private acquireWorker(signal?: AbortSignal): Promise<StockfishClient> {
    if (signal?.aborted) {
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    }

    if (this.idleWorkers.length > 0) {
      const worker = this.idleWorkers.pop()!;
      return Promise.resolve(worker);
    }

    return new Promise<StockfishClient>((resolve, reject) => {
      const onAbort = () => {
        const index = this.waitQueue.indexOf(deliverWorker);
        if (index !== -1) {
          this.waitQueue.splice(index, 1);
        }
        reject(new DOMException('Aborted', 'AbortError'));
      };

      if (signal) {
        signal.addEventListener('abort', onAbort, { once: true });
      }

      const deliverWorker = (worker: StockfishClient) => {
        if (signal) {
          signal.removeEventListener('abort', onAbort);
        }
        if (signal?.aborted) {
          this.releaseWorker(worker);
          reject(new DOMException('Aborted', 'AbortError'));
        } else {
          resolve(worker);
        }
      };

      this.waitQueue.push(deliverWorker);
    });
  }

  /**
   * Releases a background worker back to the pool.
   */
  private releaseWorker(worker: StockfishClient): void {
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift()!;
      next(worker);
    } else {
      this.idleWorkers.push(worker);
    }
  }

  /**
   * Analyzes a position as part of background queue using the multi-worker pool.
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
    if (!this.isInitialized) {
      await this.initialize();
    }

    const worker = await this.acquireWorker(options.signal);

    try {
      return await worker.analyzePosition(fen, {
        depth: options.depth || this.currentConfig.depth,
        timeMs: options.timeMs,
        multiPv: options.multiPv || 1,
        onInfo: options.onInfo,
        signal: options.signal,
      });
    } finally {
      this.releaseWorker(worker);
    }
  }

  public stop(): void {
    if (this.activeInteractiveAbortController) {
      this.activeInteractiveAbortController.abort();
      this.activeInteractiveAbortController = null;
    }
    this.interactiveClient.stop();

    for (const worker of this.backgroundPool) {
      worker.stop();
    }
    this.waitQueue = [];
  }

  public destroy(): void {
    this.stop();
    this.interactiveClient.destroy();
    for (const worker of this.backgroundPool) {
      worker.destroy();
    }
    this.backgroundPool = [];
    this.idleWorkers = [];
    this.isInitialized = false;
    EngineManager.instance = null;
  }
}
