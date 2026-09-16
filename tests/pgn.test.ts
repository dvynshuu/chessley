import { describe, it, expect } from 'vitest';
import { ChessGameModel } from '../src/chess/ChessGame';

describe('ChessGameModel & PGN', () => {
  const samplePgn = `
[Event "FIDE World Championship 2021"]
[Site "Dubai UAE"]
[Date "2021.11.26"]
[Round "1"]
[White "Nepomniachtchi, Ian"]
[Black "Carlsen, Magnus"]
[Result "1/2-1/2"]
[WhiteElo "2782"]
[BlackElo "2855"]
[ECO "C88"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. h3 Bb7 9. d3 d6 10. a3 Na5 11. Ba2 c5 12. Nbd2 Nc6 13. Nf1 Bc8 14. Ne3 Be6 15. Nd5 Bxd5 16. exd5 Nd4 17. Nd2 Nf5 18. Qf3 Qd7 19. c3 Bd8 20. Ne4 Nxe4 21. dxe4 Ne7 22. Bb1 c4 23. Bc2 Bb6 24. Qg4 Qxg4 25. hxg4 Bc5 26. g3 a5 27. Kg2 f6 28. Bd2 Rfb8 29. Rh1 h6 30. Rhf1 Kf7 31. Bd1 Ng8 32. Be2 g5 33. Rfb1 Ne7 34. a4 b4 35. Bxc4 bxc3 36. bxc3 Nc8 37. Bb5 Nb6 38. Rh1 Kg7 39. Rh5 Rh8 40. Rah1 Rac8 41. f4 Ba3 42. fxg5 hxg5 43. Rxh8 Rxh8 44. Rxh8 Kxh8 45. c4 Bb4 1/2-1/2
`;

  it('correctly parses PGN headers, players, ratings and result', () => {
    const model = new ChessGameModel(samplePgn);
    expect(model.game.white.name).toBe('Nepomniachtchi, Ian');
    expect(model.game.white.rating).toBe(2782);
    expect(model.game.black.name).toBe('Carlsen, Magnus');
    expect(model.game.black.rating).toBe(2855);
    expect(model.game.result).toBe('1/2-1/2');
    expect(model.game.eco).toBe('C88');
    expect(model.totalPlies).toBe(90);
  });

  it('generates accurate FEN for each move', () => {
    const model = new ChessGameModel(samplePgn);
    const move1 = model.getMoveAtPly(1);
    expect(move1?.san).toBe('e4');
    expect(move1?.uci).toBe('e2e4');
    expect(move1?.fenBefore).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    const move2 = model.getMoveAtPly(2);
    expect(move2?.san).toBe('e5');
    expect(move2?.uci).toBe('e7e5');

    // FEN at ply 2
    const fenAt2 = model.getFenAtPly(2);
    expect(fenAt2).toContain('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR');
  });

  it('provides legal moves at any position', () => {
    const model = new ChessGameModel(samplePgn);
    const initialMoves = model.getLegalMovesAtPly(0);
    // 20 standard initial legal moves
    expect(initialMoves.length).toBe(20);
  });
});
