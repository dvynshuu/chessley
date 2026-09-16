import { EngineInfo, EngineScore } from './EngineTypes';

export class UciParser {
  /**
   * Parses an "info ..." line from Stockfish into an EngineInfo object.
   * Returns null if line is not an info line or lacks essential depth/score/pv data.
   */
  public static parseInfoLine(line: string): EngineInfo | null {
    if (!line.startsWith('info ')) {
      return null;
    }

    const tokens = line.trim().split(/\s+/);
    let depth = 0;
    let seldepth: number | undefined;
    let multipv = 1;
    let score: EngineScore | null = null;
    let nodes: number | undefined;
    let nps: number | undefined;
    let hashfull: number | undefined;
    let time: number | undefined;
    let pv: string[] = [];

    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i];

      if (token === 'depth' && i + 1 < tokens.length) {
        depth = parseInt(tokens[++i], 10) || 0;
      } else if (token === 'seldepth' && i + 1 < tokens.length) {
        seldepth = parseInt(tokens[++i], 10);
      } else if (token === 'multipv' && i + 1 < tokens.length) {
        multipv = parseInt(tokens[++i], 10) || 1;
      } else if (token === 'score' && i + 2 < tokens.length) {
        const type = tokens[++i];
        const val = parseInt(tokens[++i], 10);
        if (type === 'cp') {
          score = { type: 'cp', value: isNaN(val) ? 0 : val };
        } else if (type === 'mate') {
          score = { type: 'mate', value: isNaN(val) ? 0 : val };
        }
      } else if (token === 'nodes' && i + 1 < tokens.length) {
        nodes = parseInt(tokens[++i], 10);
      } else if (token === 'nps' && i + 1 < tokens.length) {
        nps = parseInt(tokens[++i], 10);
      } else if (token === 'hashfull' && i + 1 < tokens.length) {
        hashfull = parseInt(tokens[++i], 10);
      } else if (token === 'time' && i + 1 < tokens.length) {
        time = parseInt(tokens[++i], 10);
      } else if (token === 'pv') {
        // Everything after pv is the move line
        pv = tokens.slice(i + 1);
        break;
      }
    }

    if (!score || depth === 0) {
      return null;
    }

    return {
      depth,
      seldepth,
      multipv,
      score,
      nodes,
      nps,
      hashfull,
      time,
      pv,
    };
  }

  /**
   * Parses a "bestmove ..." line.
   */
  public static parseBestMoveLine(line: string): { bestMove: string; ponder?: string } | null {
    if (!line.startsWith('bestmove ')) {
      return null;
    }

    const tokens = line.trim().split(/\s+/);
    const bestMove = tokens[1];
    if (!bestMove || bestMove === '(none)') {
      return null;
    }

    let ponder: string | undefined;
    if (tokens[2] === 'ponder' && tokens[3]) {
      ponder = tokens[3];
    }

    return { bestMove, ponder };
  }
}
