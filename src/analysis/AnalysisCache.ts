import { get as idbGet, set as idbSet, clear as idbClear } from 'idb-keyval';
import { EngineAnalysisResult } from '../engine/stockfish/EngineTypes';

export class AnalysisCache {
  private static instance: AnalysisCache | null = null;
  private memoryLru = new Map<string, EngineAnalysisResult>();
  private readonly MAX_MEMORY_ITEMS = 1000;
  private readonly ENGINE_VERSION = 'sf19_v2';

  public static getInstance(): AnalysisCache {
    if (!AnalysisCache.instance) {
      AnalysisCache.instance = new AnalysisCache();
    }
    return AnalysisCache.instance;
  }

  private makeKey(fen: string): string {
    // Normalize FEN to 4 positional components (board, active, castling, en-passant) for transposition hits
    const tokens = fen.trim().split(/\s+/);
    const normalized = tokens.length >= 4 ? tokens.slice(0, 4).join(' ') : fen;
    return `${this.ENGINE_VERSION}_${normalized}`;
  }

  public async get(fen: string, minDepth: number, minMultiPv = 1): Promise<EngineAnalysisResult | null> {
    const key = this.makeKey(fen);

    // 1. Check in-memory LRU
    if (this.memoryLru.has(key)) {
      const cached = this.memoryLru.get(key)!;
      const depthOk = (cached.depth || 0) >= minDepth;
      const multiPvOk = (cached.multiPvLines?.length || 1) >= minMultiPv;

      if (depthOk && multiPvOk) {
        // Refresh LRU order
        this.memoryLru.delete(key);
        this.memoryLru.set(key, cached);
        return cached;
      }
    }

    // 2. Check IndexedDB persistent store
    try {
      const stored = await idbGet<EngineAnalysisResult>(key);
      if (stored) {
        const depthOk = (stored.depth || 0) >= minDepth;
        const multiPvOk = (stored.multiPvLines?.length || 1) >= minMultiPv;

        if (depthOk && multiPvOk) {
          this.addToMemory(key, stored);
          return stored;
        }
      }
    } catch {
      // Ignore IDB errors in incognito or restricted environments
    }

    return null;
  }

  public async set(fen: string, depth: number, result: EngineAnalysisResult): Promise<void> {
    const key = this.makeKey(fen);

    // Do not overwrite higher depth calculation with lower depth
    const existing = this.memoryLru.get(key);
    if (existing && existing.depth > depth && existing.multiPvLines.length >= result.multiPvLines.length) {
      return;
    }

    this.addToMemory(key, result);

    try {
      await idbSet(key, result);
    } catch {
      // Fallback gracefully if IDB quota exceeded
    }
  }

  private addToMemory(key: string, result: EngineAnalysisResult): void {
    if (this.memoryLru.size >= this.MAX_MEMORY_ITEMS) {
      const oldestKey = this.memoryLru.keys().next().value;
      if (oldestKey) {
        this.memoryLru.delete(oldestKey);
      }
    }
    this.memoryLru.set(key, result);
  }

  public async clear(): Promise<void> {
    this.memoryLru.clear();
    try {
      await idbClear();
    } catch {
      // Ignore
    }
  }
}
