import { describe, it, expect } from 'vitest';
import { UciParser } from '../src/engine/stockfish/UciParser';

describe('UciParser', () => {
  it('parses typical centipawn info line', () => {
    const line = 'info depth 14 seldepth 18 multipv 1 score cp 45 nodes 182034 nps 1850000 time 98 pv e2e4 c7c5 g1f3 d7d6';
    const info = UciParser.parseInfoLine(line);
    expect(info).not.toBeNull();
    expect(info?.depth).toBe(14);
    expect(info?.seldepth).toBe(18);
    expect(info?.multipv).toBe(1);
    expect(info?.score).toEqual({ type: 'cp', value: 45 });
    expect(info?.nodes).toBe(182034);
    expect(info?.nps).toBe(1850000);
    expect(info?.time).toBe(98);
    expect(info?.pv).toEqual(['e2e4', 'c7c5', 'g1f3', 'd7d6']);
  });

  it('parses mate score info line', () => {
    const line = 'info depth 18 seldepth 22 multipv 1 score mate 3 nodes 450123 nps 2100000 time 214 pv d1h5 g7g6 h5g6';
    const info = UciParser.parseInfoLine(line);
    expect(info).not.toBeNull();
    expect(info?.depth).toBe(18);
    expect(info?.score).toEqual({ type: 'mate', value: 3 });
    expect(info?.pv).toEqual(['d1h5', 'g7g6', 'h5g6']);
  });

  it('parses negative mate score info line', () => {
    const line = 'info depth 12 score mate -2 nodes 12340 pv c8h3 g2h3';
    const info = UciParser.parseInfoLine(line);
    expect(info).not.toBeNull();
    expect(info?.score).toEqual({ type: 'mate', value: -2 });
  });

  it('parses bestmove with ponder', () => {
    const line = 'bestmove e2e4 ponder c7c5';
    const parsed = UciParser.parseBestMoveLine(line);
    expect(parsed).toEqual({ bestMove: 'e2e4', ponder: 'c7c5' });
  });

  it('parses bestmove without ponder', () => {
    const line = 'bestmove e7e8q';
    const parsed = UciParser.parseBestMoveLine(line);
    expect(parsed).toEqual({ bestMove: 'e7e8q', ponder: undefined });
  });

  it('returns null for non-info lines', () => {
    expect(UciParser.parseInfoLine('uciok')).toBeNull();
    expect(UciParser.parseInfoLine('readyok')).toBeNull();
    expect(UciParser.parseInfoLine('Stockfish 19 by the Stockfish developers')).toBeNull();
  });
});
