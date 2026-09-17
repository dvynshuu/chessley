import { describe, it, expect } from 'vitest';
import { ENGINE_PRESETS } from '../src/engine/stockfish/EngineTypes';
import { EngineManager } from '../src/engine/stockfish/EngineManager';

describe('Chessley v2.0 Max Level Engine', () => {
  it('has valid Max Level engine preset configuration', () => {
    const maxPreset = ENGINE_PRESETS.max;
    expect(maxPreset).toBeDefined();
    expect(maxPreset.mode).toBe('max');
    expect(maxPreset.depth).toBeGreaterThanOrEqual(24);
    expect(maxPreset.hash).toBeGreaterThanOrEqual(128);
    expect(maxPreset.skillLevel).toBe(20);
    expect(maxPreset.timeLimitMs).toBeGreaterThanOrEqual(2000);
  });

  it('provides multi-worker capacity in EngineManager', () => {
    const manager = EngineManager.getInstance();
    expect(manager).toBeDefined();
    const workerCount = manager.getWorkerCount();
    expect(workerCount).toBeGreaterThanOrEqual(3); // At least 2 background workers + 1 interactive
  });

  it('initializes EngineManager with max configuration mode', async () => {
    const manager = EngineManager.getInstance();
    await manager.setMode('max');
    const config = manager.getConfig();
    expect(config.mode).toBe('max');
    expect(config.depth).toBe(24);
    expect(config.hash).toBe(128);
  });

  it('supports custom depth beyond 22 up to 30', async () => {
    const manager = EngineManager.getInstance();
    await manager.setMode('custom', { depth: 30 });
    const config = manager.getConfig();
    expect(config.depth).toBe(30);
  });
});
