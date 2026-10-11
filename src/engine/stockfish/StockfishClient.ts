import { EngineAnalysisResult, EngineConfig, EngineInfo, ENGINE_PRESETS } from './EngineTypes';
import { UciParser } from './UciParser';
import { normalizeToWhitePerspective } from '../../chess/EvaluationUtils';
import { EngineScore, PieceColor } from '../../chess/types';
import { Chess } from 'chess.js';

export class StockfishClient {
  private worker: Worker | null = null;
  private isReady = false;
  private isSearching = false;
  private currentRequestId = 0;
  private activeConfig: EngineConfig = ENGINE_PRESETS.balanced;
  private workerUrl = '/engine/stockfish-19-lite-single.js';
  private activeStopPromise: Promise<void> | null = null;

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
          this.destroy();
          reject(new Error('Stockfish worker initialization timed out (10s)'));
        }, 10000);

        this.worker.onmessage = (e: MessageEvent) => {
          const line = typeof e.data === 'string' ? e.data : '';
          this.handleLine(line);
        };

        this.worker.onerror = (err) => {
          console.error('[Stockfish Worker Error]:', err);
          this.isReady = false;
          this.isSearching = false;
          try {
            this.worker?.terminate();
          } catch {}
          this.worker = null;
          reject(err);
        };

        // Initialize UCI handshake
        this.sendCommand('uci');
        this.waitForLine('uciok', 10000)
          .then(() => {
            this.sendCommand('isready');
            return this.waitForLine('readyok', 10000);
          })
          .then(async () => {
            this.isReady = true;
            clearTimeout(timeout);
            await this.applyConfig(this.activeConfig);
            resolve();
          })
          .catch((err) => {
            clearTimeout(timeout);
            this.destroy();
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  }

  public async applyConfig(config: EngineConfig): Promise<void> {
    this.activeConfig = config;
    if (!this.isReady || !this.worker) return;

    if (this.isSearching || this.activeStopPromise) {
      await this.stop();
    }

    this.sendCommand(`setoption name Skill Level value ${config.skillLevel ?? 20}`);
    this.sendCommand('setoption name Move Overhead value 10');
    this.sendCommand(`setoption name Hash value ${config.hash}`);
    this.sendCommand(`setoption name MultiPV value ${config.multiPv}`);
    this.sendCommand('isready');
    await this.waitForLine('readyok', 5000);
  }

  public async newGame(): Promise<void> {
    if (!this.isReady || !this.worker) return;
    if (this.isSearching || this.activeStopPromise) {
      await this.stop();
    }
    this.sendCommand('ucinewgame');
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
    // Fast path: Check for terminal position (Checkmate, Stalemate, Draw)
    try {
      const chess = new Chess(fen);
      if (chess.isGameOver()) {
        const sideToMove: PieceColor = chess.turn() as PieceColor;
        let score: EngineScore;
        let normalizedScore: EngineScore;

        if (chess.isCheckmate()) {
          // The side to move has been checkmated (-0)
          score = { type: 'mate', value: -0 };
          normalizedScore = sideToMove === 'b' ? { type: 'mate', value: 0 } : { type: 'mate', value: -0 };
        } else {
          // Stalemate, 50-move rule, insufficient material, repetition
          score = { type: 'cp', value: 0 };
          normalizedScore = { type: 'cp', value: 0 };
        }

        const terminalResult: EngineAnalysisResult = {
          fen,
          sideToMove,
          bestMove: '',
          score,
          normalizedScore,
          depth: 99,
          nodes: 0,
          nps: 0,
          timeMs: 0,
          principalVariation: [],
          multiPvLines: [
            {
              depth: 99,
              multipv: 1,
              score,
              pv: [],
            },
          ],
        };
        options.onInfo?.(terminalResult.multiPvLines[0]);
        return terminalResult;
      }
    } catch {
      // Fallback to engine if FEN is non-standard
    }

    if (!this.isReady) {
      await this.init();
    }

    // Abort if signal already triggered
    if (options.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    // Stop previous search if any and wait until engine is quiescent
    if (this.isSearching || this.activeStopPromise) {
      await this.stop();
    }

    if (options.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
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
        this.stop().catch(() => {});
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
          let score = topInfo?.score || { type: 'cp', value: 0 };
          if (score.type === 'mate' && score.value === 0) {
            score = { type: 'mate', value: -0 };
          }
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

  public async stop(): Promise<void> {
    if (!this.worker) return;
    if (!this.isSearching && !this.activeStopPromise) return;

    if (this.activeStopPromise) {
      return this.activeStopPromise;
    }

    this.activeStopPromise = new Promise<void>((resolve) => {
      let resolved = false;
      const done = () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        this.removeLineListener(listener);
        this.isSearching = false;
        this.activeStopPromise = null;
        resolve();
      };

      const timer = setTimeout(done, 1200);

      const listener = (line: string) => {
        if (line.includes('readyok')) {
          done();
        }
      };

      this.onLineCallbacks.push(listener);
      this.sendCommand('stop');
      this.sendCommand('isready');
    });

    return this.activeStopPromise;
  }

  public destroy(): void {
    this.activeStopPromise = null;
    this.isSearching = false;
    this.isReady = false;
    if (this.worker) {
      try {
        this.worker.postMessage('quit');
        this.worker.terminate();
      } catch {}
      this.worker = null;
    }
  }
}
