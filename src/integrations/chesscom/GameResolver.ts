export interface FeaturedGame {
  title: string;
  subtitle: string;
  white: string;
  black: string;
  year: string;
  pgn: string;
  description: string;
}

export const FEATURED_GAMES: FeaturedGame[] = [
  {
    title: "Kasparov's Immortal",
    subtitle: 'Wijk aan Zee 1999',
    white: 'Garry Kasparov',
    black: 'Veselin Topalov',
    year: '1999',
    description: 'Regarded as one of the greatest chess games in history featuring the stunning 24. Rxd4!! sacrifice.',
    pgn: `[Event "Hoogovens A"]
[Site "Wijk aan Zee NED"]
[Date "1999.01.20"]
[Round "4"]
[White "Kasparov, Garry"]
[Black "Topalov, Veselin"]
[Result "1-0"]
[WhiteElo "2812"]
[BlackElo "2700"]
[ECO "B07"]

1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6
Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4
15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1
d4 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 26. Qxd4+ Kxa5 27. b4+
Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+
Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8
Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7 1-0`,
  },
  {
    title: 'The Opera Game',
    subtitle: 'Paris 1858',
    white: 'Paul Morphy',
    black: 'Duke of Brunswick & Count Isouard',
    year: '1858',
    description: 'The archetype of classical development and tempo, culminating in the immortal queen sacrifice 16. Qb8+!!.',
    pgn: `[Event "Paris"]
[Site "Paris FRA"]
[Date "1858.10.21"]
[White "Paul Morphy"]
[Black "Duke of Brunswick and Count Isouard"]
[Result "1-0"]
[ECO "C41"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`,
  },
  {
    title: 'Fischer vs Spassky, Game 6',
    subtitle: 'World Championship 1972',
    white: 'Bobby Fischer',
    black: 'Boris Spassky',
    year: '1972',
    description: 'Fischer plays 1. c4 for the first time in his life and produces a masterpiece praised even by Spassky.',
    pgn: `[Event "World Championship 28th"]
[Site "Reykjavik ISL"]
[Date "1972.07.23"]
[Round "6"]
[White "Fischer, Robert James"]
[Black "Spassky, Boris V"]
[Result "1-0"]
[WhiteElo "2785"]
[BlackElo "2660"]
[ECO "D59"]

1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6 8. cxd5
Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6
15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4
21. f4 Qe7 22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5 27. Rxf5
Nh7 28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7 32. Qe5 Qe8 33. a4 Qd8
34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8 37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6 Kg8
40. Bc4 Kh8 41. Qf4 1-0`,
  },
];

export class GameResolver {
  /**
   * Resolves an arbitrary input string:
   * 1. If it's a URL, tries extracting game ID or username.
   * 2. If it's PGN format (starts with [Event or 1.), returns PGN directly.
   * 3. Otherwise treats as a potential username.
   */
  public static detectInputType(input: string): 'url' | 'pgn' | 'username' {
    const trimmed = input.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return 'url';
    }
    if (trimmed.startsWith('[') || /^[0-9]+\.\s+[a-zA-Z]/.test(trimmed)) {
      return 'pgn';
    }
    return 'username';
  }

  public static parseChessComUrl(url: string): { gameId?: string; type?: string } {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      // Format: /game/live/12345 or /game/daily/12345
      if (parts[0] === 'game' && parts[1] && parts[2]) {
        return {
          type: parts[1],
          gameId: parts[2],
        };
      }
    } catch {
      // Ignore
    }
    return {};
  }
}
