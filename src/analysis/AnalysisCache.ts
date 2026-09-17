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

  private makeKey(fen: string, depth: number): string {
    return `${this.ENGINE_VERSION}_d${depth}_${fen}`;
  }

  public async get(fen: string, minDepth: number): Promise<EngineAnalysisResult | null> {
    const key = this.makeKey(fen, minDepth);

    // 1. Check in-memory LRU
    if (this.memoryLru.has(key)) {
      const result = this.memoryLru.get(key)!;
      // Refresh LRU order
      this.memoryLru.delete(key);
      this.memoryLru.set(key, result);
      return result;
    }

    // 2. Check IndexedDB persistent store
    try {
      const stored = await idbGet<EngineAnalysisResult>(key);
      if (stored) {
        this.addToMemory(key, stored);
        return stored;
      }
    } catch {
      // Ignore IDB errors in incognito or restricted environments
    }

    return null;
  }

  public async set(fen: string, depth: number, result: EngineAnalysisResult): Promise<void> {
    const key = this.makeKey(fen, depth);
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
