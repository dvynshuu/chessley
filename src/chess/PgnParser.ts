import { ChessGame, MoveAnalysis } from './types';
import { formatScore } from './EvaluationUtils';
import { CLASSIFICATION_META } from './Classification';

export function exportAnnotatedPgn(
  game: ChessGame,
  analyses: Record<number, MoveAnalysis>
): string {
  let pgn = '';

  // Write headers
  const headers: Record<string, string> = {
    Event: game.metadata['Event'] || 'Chessley Analysis',
    Site: game.metadata['Site'] || 'https://chessley.app',
    Date: game.date || new Date().toISOString().split('T')[0],
    Round: game.metadata['Round'] || '-',
    White: game.white.name || 'White',
    Black: game.black.name || 'Black',
    Result: game.result || '*',
    ...(game.white.rating ? { WhiteElo: String(game.white.rating) } : {}),
    ...(game.black.rating ? { BlackElo: String(game.black.rating) } : {}),
    ...(game.timeControl ? { TimeControl: game.timeControl } : {}),
    ...(game.eco ? { ECO: game.eco } : {}),
    Annotator: 'Stockfish 19 / Chessley Engine',
  };

  for (const [key, val] of Object.entries(headers)) {
    pgn += `[${key} "${val}"]\n`;
  }
  pgn += '\n';

  // Format moves
  let line = '';
  for (let i = 0; i < game.moves.length; i++) {
    const move = game.moves[i];
    const isWhite = move.color === 'w';
    let moveToken = '';

    if (isWhite) {
      moveToken += `${move.moveNumber}. `;
    } else if (i === 0) {
      moveToken += `${move.moveNumber}... `;
    }

    moveToken += move.san;

    const analysis = analyses[move.ply];
    if (analysis) {
      const meta = CLASSIFICATION_META[analysis.classification];
      const evalStr = formatScore(analysis.playedScoreAfter, 'w');
      let comment = ` { [eval ${evalStr}] ${meta.name}`;

      if (analysis.classification === 'blunder' || analysis.classification === 'mistake' || analysis.classification === 'missed_win') {
        const bestSan = analysis.bestMoveSan || analysis.bestMove;
        comment += ` (best was ${bestSan})`;
      }
      comment += ' }';
      moveToken += comment;
    }

    if (line.length + moveToken.length > 80) {
      pgn += line.trim() + '\n';
      line = moveToken + ' ';
    } else {
      line += moveToken + ' ';
    }
  }

  if (line.trim().length > 0) {
    pgn += line.trim() + ' ';
  }

  pgn += `${game.result}\n`;
  return pgn;
}
