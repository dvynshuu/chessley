export interface ChessComGameSummary {
  id: string;
  url: string;
  pgn: string;
  timeControl: string;
  endTime: number;
  date: string;
  white: {
    username: string;
    rating: number;
    result: string;
  };
  black: {
    username: string;
    rating: number;
    result: string;
  };
}

export class ChessComClient {
  private static readonly BASE_URL = 'https://api.chess.com/pub';
  private static readonly HEADERS = {
    'User-Agent': 'Chessley-Stockfish-Analyzer/1.0 (contact@chessley.app)',
  };

  /**
   * Retrieves list of monthly archive URLs for a username.
   */
  public static async getArchives(username: string): Promise<string[]> {
    const cleanUser = username.trim().toLowerCase();
    const url = `${this.BASE_URL}/player/${encodeURIComponent(cleanUser)}/games/archives`;

    const res = await fetch(url, { headers: this.HEADERS });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Chess.com user "${cleanUser}" not found.`);
      }
      throw new Error(`Chess.com API error (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    return data.archives || [];
  }

  /**
   * Retrieves games from a monthly archive URL.
   */
  public static async getMonthlyGames(archiveUrl: string): Promise<ChessComGameSummary[]> {
    const res = await fetch(archiveUrl, { headers: this.HEADERS });
    if (!res.ok) {
      throw new Error(`Failed to load archive: ${res.statusText}`);
    }

    const data = await res.json();
    const games = data.games || [];

    return games
      .filter((g: any) => g.pgn)
      .map((g: any) => {
        const dateStr = g.end_time ? new Date(g.end_time * 1000).toISOString().split('T')[0] : '';
        return {
          id: g.url || `chesscom_${g.end_time}`,
          url: g.url,
          pgn: g.pgn,
          timeControl: g.time_control || 'Standard',
          endTime: g.end_time,
          date: dateStr,
          white: {
            username: g.white.username,
            rating: g.white.rating,
            result: g.white.result,
          },
          black: {
            username: g.black.username,
            rating: g.black.rating,
            result: g.black.result,
          },
        };
      })
      .reverse(); // Most recent first
  }

  /**
   * Retrieves the most recent games for a given username.
   */
  public static async getRecentGames(username: string, maxGames = 20): Promise<ChessComGameSummary[]> {
    const archives = await this.getArchives(username);
    if (archives.length === 0) {
      return [];
    }

    // Take the most recent archive month
    const latestArchive = archives[archives.length - 1];
    const games = await this.getMonthlyGames(latestArchive);

    // If latest month has fewer games than requested, optionally check previous month
    if (games.length < maxGames && archives.length > 1) {
      const prevArchive = archives[archives.length - 2];
      const prevGames = await this.getMonthlyGames(prevArchive);
      return [...games, ...prevGames].slice(0, maxGames);
    }

    return games.slice(0, maxGames);
  }
}
