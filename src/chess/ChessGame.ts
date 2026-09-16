import { Chess, Move } from 'chess.js';
import { ChessGame, ChessMove, GameResult, PieceColor, Player } from './types';

export class ChessGameModel {
  public game: ChessGame;
  private chessInstances: Chess[] = [];

  constructor(pgnOrGame?: string | ChessGame) {
    if (typeof pgnOrGame === 'string') {
      this.game = ChessGameModel.parsePgn(pgnOrGame);
    } else if (pgnOrGame) {
      this.game = pgnOrGame;
    } else {
      this.game = ChessGameModel.createEmptyGame();
    }
    this.reconstructInstances();
  }

  public static createEmptyGame(): ChessGame {
    return {
      id: `game_${Date.now()}`,
      white: { name: 'White', rating: 1500 },
      black: { name: 'Black', rating: 1500 },
      result: '*',
      pgn: '',
      moves: [],
      source: 'manual',
      metadata: {},
    };
  }

  /**
   * Parses a PGN string into a normalized ChessGame model.
   */
  public static parsePgn(rawPgn: string, source: 'chesscom' | 'pgn' | 'manual' = 'pgn'): ChessGame {
    const chess = new Chess();
    const cleanPgn = rawPgn.trim();

    try {
      chess.loadPgn(cleanPgn);
    } catch {
      // In case PGN has non-standard trailing characters or annotations, try standardizing
      const sanitized = cleanPgn.replace(/\[%[^\]]+\]/g, ''); // strip Chess.com clock bracket annotations for parser
      chess.loadPgn(sanitized);
    }

    const headers = chess.header();
    const history = chess.history({ verbose: true }) as Move[];

    const whitePlayer: Player = {
      name: headers['White'] || 'White',
      rating: headers['WhiteElo'] ? parseInt(headers['WhiteElo'], 10) : undefined,
      title: headers['WhiteTitle'] || undefined,
    };

    const blackPlayer: Player = {
      name: headers['Black'] || 'Black',
      rating: headers['BlackElo'] ? parseInt(headers['BlackElo'], 10) : undefined,
      title: headers['BlackTitle'] || undefined,
    };

    let result: GameResult = '*';
    const rawResult = headers['Result'] || chess.header()['Result'];
    if (rawResult === '1-0' || rawResult === '0-1' || rawResult === '1/2-1/2') {
      result = rawResult;
    }

    const moves: ChessMove[] = history.map((m, index) => {
      const ply = index + 1;
      const moveNumber = Math.floor(index / 2) + 1;
      const uci = `${m.from}${m.to}${m.promotion ? m.promotion.toLowerCase() : ''}`;

      return {
        ply,
        moveNumber,
        color: m.color as PieceColor,
        san: m.san,
        uci,
        from: m.from,
        to: m.to,
        piece: m.piece,
        captured: m.captured,
        promotion: m.promotion,
        fenBefore: m.before,
        fenAfter: m.after,
      };
    });

    return {
      id: headers['Link'] || headers['Site'] || `game_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      white: whitePlayer,
      black: blackPlayer,
      result,
      date: headers['Date'] || headers['UTCDate'] || undefined,
      timeControl: headers['TimeControl'] || undefined,
      eco: headers['ECO'] || undefined,
      opening: headers['Opening'] || (headers['ECO'] ? `ECO ${headers['ECO']}` : undefined),
      pgn: cleanPgn,
      moves,
      source,
      metadata: headers as Record<string, string>,
    };
  }

  private reconstructInstances() {
    this.chessInstances = [];
    const root = new Chess();
    this.chessInstances.push(root);

    for (const move of this.game.moves) {
      const prev = this.chessInstances[this.chessInstances.length - 1];
      const next = new Chess(prev.fen());
      next.move({
        from: move.from as any,
        to: move.to as any,
        promotion: (move.promotion?.toLowerCase() as any) || undefined,
      });
      this.chessInstances.push(next);
    }
  }

  public get totalPlies(): number {
    return this.game.moves.length;
  }

  public getFenAtPly(ply: number): string {
    if (ply <= 0 || this.chessInstances.length === 0) {
      return new Chess().fen();
    }
    const idx = Math.min(ply, this.chessInstances.length - 1);
    return this.chessInstances[idx].fen();
  }

  public getMoveAtPly(ply: number): ChessMove | undefined {
    if (ply <= 0 || ply > this.game.moves.length) {
      return undefined;
    }
    return this.game.moves[ply - 1];
  }

  public getLegalMovesAtPly(ply: number): Array<{ from: string; to: string; promotion?: string }> {
    const idx = Math.min(Math.max(0, ply), this.chessInstances.length - 1);
    const inst = this.chessInstances[idx] || new Chess();
    return inst.moves({ verbose: true }).map((m) => ({
      from: m.from,
      to: m.to,
      promotion: m.promotion,
    }));
  }

  public isInCheck(ply: number): boolean {
    const idx = Math.min(Math.max(0, ply), this.chessInstances.length - 1);
    const inst = this.chessInstances[idx];
    return inst ? inst.inCheck() : false;
  }
}
