import { describe, it, expect } from 'vitest';
import { classifyMove, DEFAULT_CLASSIFICATION_CONFIG } from '../src/chess/Classification';
import { ChessMove } from '../src/chess/types';

describe('Classification', () => {
  const dummyMove: ChessMove = {
    ply: 1,
    moveNumber: 1,
    color: 'w',
    san: 'e4',
    uci: 'e2e4',
    from: 'e2',
    to: 'e4',
    piece: 'p',
    fenBefore: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    fenAfter: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
  };

  it('classifies exact engine best move as best', () => {
    const classification = classifyMove(
      dummyMove,
      'e2e4',
      'e2e4',
      50,
      50,
      0,
      DEFAULT_CLASSIFICATION_CONFIG
    );
    expect(classification).toBe('best');
  });

  it('classifies small win prob loss as excellent or good', () => {
    const excellent = classifyMove(
      dummyMove,
      'd2d4',
      'e2e4',
      50,
      48.5,
      1.5,
      DEFAULT_CLASSIFICATION_CONFIG
    );
    expect(excellent).toBe('excellent');

    const good = classifyMove(
      dummyMove,
      'g1f3',
      'e2e4',
      50,
      46.0,
      4.0,
      DEFAULT_CLASSIFICATION_CONFIG
    );
    expect(good).toBe('good');
  });

  it('classifies larger win prob losses as inaccuracy, mistake, or blunder', () => {
    const inaccuracy = classifyMove(
      dummyMove,
      'h2h4',
      'e2e4',
      50,
      42.0,
      8.0,
      DEFAULT_CLASSIFICATION_CONFIG
    );
    expect(inaccuracy).toBe('inaccuracy');

    const mistake = classifyMove(
      dummyMove,
      'f2f3',
      'e2e4',
      50,
      34.0,
      16.0,
      DEFAULT_CLASSIFICATION_CONFIG
    );
    expect(mistake).toBe('mistake');

    const blunder = classifyMove(
      dummyMove,
      'g2g4',
      'e2e4',
      50,
      22.0,
      28.0,
      DEFAULT_CLASSIFICATION_CONFIG
    );
    expect(blunder).toBe('blunder');
  });

  it('detects missed win when dropping huge advantage', () => {
    const missedWin = classifyMove(
      dummyMove,
      'a2a3',
      'd1h5',
      85, // had 85% win probability
      50, // dropped down to 50%
      35,
      DEFAULT_CLASSIFICATION_CONFIG
    );
    expect(missedWin).toBe('missed_win');
  });

  it('classifies book move when isBookMove is true', () => {
    const book = classifyMove(
      dummyMove,
      'e2e4',
      'e2e4',
      50,
      50,
      0,
      DEFAULT_CLASSIFICATION_CONFIG,
      undefined,
      true
    );
    expect(book).toBe('book');
  });
});
