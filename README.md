# Chessley ♟️⚡

> **Precision Chess.com Stockfish 19 Game Analyzer from Scratch**

Chessley is a high-accuracy, lightning-fast chess game analyzer powered by real **Stockfish 19 WebAssembly**, dedicated Web Worker architecture, mathematical win-probability accuracy modeling, and a high-performance workstation interface.

---

## Features

- **Real Stockfish 19 WebAssembly Engine**:
  - Employs Chess.com's official `stockfish@19.0.0` distribution (`stockfish-19-lite-single.wasm` and `stockfish-19-lite-single.js`, ~1.6MB).
  - Web Worker isolation with zero main-thread blocking.
  - Strongly typed UCI parser with request ID race-condition guards and cancellation support.
- **Multi-Pass Adaptive Priority Scheduler**:
  - **Priority 100**: Instant live analysis for the current visible board position.
  - **Pass 1**: Rapid whole-game scan across all plies.
  - **Pass 2**: Deep refinement targeting blunders, mistakes, and tactical swings.
- **Mathematical Accuracy & Classification Model**:
  - Standard Lichess/Chess.com sigmoid win probability model:
    $$WP(cp) = \frac{100}{1 + e^{-0.00368208 \times cp}}$$
    $$Accuracy = 103.1668 \times e^{-0.04354 \times Loss} - 3.1668$$
  - Move classification: Brilliant (`!!`), Great (`!`), Best (`★`), Excellent (`✓`), Good (`✓`), Inaccuracy (`?!`), Mistake (`?`), Blunder (`??`), Missed Win (`✕`).
- **Workstation Interface**:
  - Interactive vector chessboard with 4 board themes (Tournament, Dark Obsidian, Glass Ice, Classic Wood).
  - Dynamic SVG arrows: glowing emerald arrows for best moves, crimson arrows for blunders.
  - In-place floating classification badges on destination squares.
  - Precision vertical evaluation bar with animated non-linear transitions.
  - High-DPI HTML5 Canvas evaluation graph with hover scrubbing and blunder markers.
  - Real-time engine statistics: depth, nodes, NPS, hash, and interactive clickable Principal Variation lines.
  - Procedural Web Audio API sound synthesizer: zero-latency wooden clicks, captures, check bells, and blunder alerts.
- **Chess.com Integration & Export**:
  - Search public Chess.com username archives (`api.chess.com/pub/player/{user}/games/...`) for 1-click game loading.
  - Pre-bundled featured master games (Kasparov's Immortal, Morphy Opera Game, Fischer Game 6).
  - PGN paste and Chess.com URL resolver.
  - Export annotated PGN with Stockfish comments (`{ [eval +0.8] Best }`, `{ [eval -2.4] Blunder }`), raw PGN, JSON dump, and FEN.

---

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Zustand (atomic selective subscriptions eliminating re-render lag)
- **Chess Logic**: `chess.js` (move generation, legal validation, FEN, PGN)
- **Engine**: Stockfish 19 WebAssembly
- **Caching**: Multi-tier in-memory LRU + IndexedDB (`idb-keyval`)
- **Testing**: Vitest (25 unit tests covering UCI, math, classifications, and tactical positions)
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/dvynshuu/chessley.git
cd chessley

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be accessible at `http://localhost:5173/` (or `http://localhost:5174/`).

### Running Tests

```bash
npm run test
```

### Production Build

```bash
npm run build
```

---

## License

MIT License. Stockfish is licensed under GPLv3.
