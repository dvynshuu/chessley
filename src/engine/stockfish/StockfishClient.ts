import { EngineAnalysisResult, EngineConfig, EngineInfo, ENGINE_PRESETS } from './EngineTypes';
import { UciParser } from './UciParser';
import { normalizeToWhitePerspective } from '../../chess/EvaluationUtils';
import { PieceColor } from '../../chess/types';

export class StockfishClient {
  private worker: Worker | null = null;
  private isReady = false;
  private isSearching = false;
  private currentRequestId = 0;
  private activeConfig: EngineConfig = ENGINE_PRESETS.balanced;
  private workerUrl = '/engine/stockfish-19-lite-single.js';

  private onLineCallbacks: Array<(line: string) => void> = [];

  constructor(workerUrl?: string) {
    if (workerUrl) {
      this.workerUrl = workerUrl;
    }
  }

  public async init(): Promise<void> {
    if (this.worker && this.isReady) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker(this.workerUrl);

        const timeout = setTimeout(() => {
          reject(new Error('Stockfish worker initialization timed out (10s)'));
        }, 10000);

        this.worker.onmessage = (e: MessageEvent) => {
          const line = typeof e.data === 'string' ? e.data : '';
          this.handleLine(line);
        };

        this.worker.onerror = (err) => {
          console.error('[Stockfish Worker Error]:', err);
          reject(err);
        };

        // Initialize UCI
        this.sendCommand('uci');
        this.waitForLine('uciok', 10000)
          .then(() => {
            this.sendCommand('isready');
            return this.waitForLine('readyok', 10000);
          })
          .then(() => {
            this.isReady = true;
            clearTimeout(timeout);
            this.applyConfig(this.activeConfig);
            resolve();
          })
          .catch((err) => {
            clearTimeout(timeout);
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  }

  public async applyConfig(config: EngineConfig): Promise<void> {
    this.activeConfig = config;
    if (!this.isReady) return;

    this.sendCommand(`setoption name Hash value ${config.hash}`);
    this.sendCommand(`setoption name MultiPV value ${config.multiPv}`);
    this.sendCommand('isready');
    await this.waitForLine('readyok', 5000);
  }

  public sendCommand(cmd: string): void {
    if (!this.worker) {
      console.warn('[Stockfish] Cannot send command, worker not initialized:', cmd);
      return;
    }
    this.worker.postMessage(cmd);
  }

  private handleLine(line: string): void {
    // Notify all active line listeners
    for (const cb of [...this.onLineCallbacks]) {
      cb(line);
    }
  }

  public waitForLine(expected: string, timeoutMs = 8000): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.removeLineListener(listener);
        reject(new Error(`Timeout waiting for Stockfish line: "${expected}"`));
      }, timeoutMs);

      const listener = (line: string) => {
        if (line.includes(expected)) {
          clearTimeout(timer);
          this.removeLineListener(listener);
          resolve(line);
        }
      };

      this.onLineCallbacks.push(listener);
    });
  }

  private removeLineListener(cb: (line: string) => void): void {
    this.onLineCallbacks = this.onLineCallbacks.filter((c) => c !== cb);
  }

  /**
   * Analyzes a single FEN position.
   * Fully supports AbortSignal, progressive info streaming, and race condition protection.
   */
  public async analyzePosition(
    fen: string,
    options: {
      depth?: number;
      timeMs?: number;
      multiPv?: number;
      onInfo?: (info: EngineInfo) => void;
      signal?: AbortSignal;
    } = {}
  ): Promise<EngineAnalysisResult> {
    if (!this.isReady) {
      await this.init();
    }

    // Abort if signal already triggered
    if (options.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    // Stop previous search if any
    if (this.isSearching) {
      this.stop();
    }

    const requestId = ++this.currentRequestId;
    this.isSearching = true;

    // Determine side to move from FEN (second field)
    const fenTokens = fen.split(' ');
    const sideToMove: PieceColor = fenTokens[1] === 'b' ? 'b' : 'w';

    const targetDepth = options.depth || this.activeConfig.depth;
    const timeLimit = options.timeMs || this.activeConfig.timeLimitMs;
    const targetMultiPv = options.multiPv || this.activeConfig.multiPv;

    if (targetMultiPv !== this.activeConfig.multiPv) {
      this.sendCommand(`setoption name MultiPV value ${targetMultiPv}`);
    }

    this.sendCommand(`position fen ${fen}`);

    let goCmd = `go depth ${targetDepth}`;
    if (timeLimit && timeLimit > 0) {
      goCmd += ` movetime ${timeLimit}`;
    }
    this.sendCommand(goCmd);

    return new Promise<EngineAnalysisResult>((resolve, reject) => {
      const latestMultiPvLines = new Map<number, EngineInfo>();
      let topInfo: EngineInfo | null = null;

      const onAbort = () => {
        cleanup();
        this.stop();
        reject(new DOMException('Aborted', 'AbortError'));
      };

      if (options.signal) {
        options.signal.addEventListener('abort', onAbort);
      }

      const listener = (line: string) => {
        // Discard responses from older requests
        if (requestId !== this.currentRequestId) {
          cleanup();
          return;
        }

        // Parse info
        if (line.startsWith('info ')) {
          const info = UciParser.parseInfoLine(line);
          if (info) {
            latestMultiPvLines.set(info.multipv, info);
            if (info.multipv === 1) {
              topInfo = info;
              options.onInfo?.(info);
            }
          }
        }

        // Parse bestmove
        if (line.startsWith('bestmove ')) {
          cleanup();
          this.isSearching = false;

          const parsed = UciParser.parseBestMoveLine(line);
          const bestMove = parsed?.bestMove || (topInfo?.pv?.[0] ?? '');
          const score = topInfo?.score || { type: 'cp', value: 0 };
          const normalizedScore = normalizeToWhitePerspective(score, sideToMove);

          const result: EngineAnalysisResult = {
            fen,
            sideToMove,
            bestMove,
            ponder: parsed?.ponder,
            score,
            normalizedScore,
            depth: topInfo?.depth || targetDepth,
            nodes: topInfo?.nodes,
            nps: topInfo?.nps,
            timeMs: topInfo?.time,
            principalVariation: topInfo?.pv || (bestMove ? [bestMove] : []),
            multiPvLines: Array.from(latestMultiPvLines.values()),
          };

          resolve(result);
        }
      };

      const cleanup = () => {
        this.removeLineListener(listener);
        if (options.signal) {
          options.signal.removeEventListener('abort', onAbort);
        }
      };

      this.onLineCallbacks.push(listener);
    });
  }

  public stop(): void {
    if (this.isSearching) {
      this.sendCommand('stop');
      this.isSearching = false;
    }
  }

  public destroy(): void {
    this.stop();
    this.sendCommand('quit');
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = false;
  }
}
