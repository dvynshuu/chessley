# Chessley ♟️⚡ (v2.0 Max Level Edition)

> **Precision Chess.com Stockfish 19 Game Analyzer — Multi-Core Parallel Architecture**

Chessley is a high-accuracy, lightning-fast chess game analyzer powered by real **Stockfish 19 WebAssembly**, multi-core Web Worker parallel architecture, mathematical win-probability accuracy modeling, and a high-performance workstation interface.

---

## Features

- **v2.0 Max Level (Grandmaster) Engine & Multi-Worker Architecture**:
  - **Max Level Mode**: Depth 24+, 128MB Hash table, Skill Level 20, with target depth configurable up to 30.
  - **Parallel Multi-Worker Pool**: Dynamically provisions concurrent background Web Workers (`navigator.hardwareConcurrency` aware) delivering 2x–4x faster whole-game analysis.
  - **Dedicated Interactive Worker**: Fully decoupled interactive worker ensures instantaneous, zero-latency live board scrubbing even while whole-game background analysis is underway.
  - **FEN Position Deduplication**: Automatically eliminates redundant evaluations across repeated board states.
  - Strongly typed UCI parser with request ID race-condition guards and cancellation support.
- **Multi-Pass Adaptive Priority Scheduler**:
  - **Priority 100**: Instant live analysis for the current visible board position.
  - **Pass 1**: Rapid parallel scan across all unique plies.
  - **Pass 2**: Deep refinement targeting blunders, mistakes, and tactical swings at depth 24.
- **Mathematical Accuracy & Classification Model**:
  - Standard Lichess/Chess.com sigmoid win probability model:
    $$WP(cp) = \frac{100}{1 + e^{-0.00368208 \times cp}}$$
    $$Accuracy = 103.1668 \times e^{-0.04354 \times Loss} - 3.1668$$
  - Move classification: Brilliant (`!!`), Great (`!`), Best (`★`), Excellent (`✓`), Good (`✓`), Inaccuracy (`?!`), Mistake (`?`), Blunder (`??`), Missed Win (`✕`).
- **Workstation Interface & Luxury Visual Design**:
  - Atmospheric celestial radial mesh background (`#060911` with purple/cyan ambient auras).
  - Premium frosted glassmorphism cards (`backdrop-filter: blur(16px)`), subtle neon halos, and satin scrollbars.
  - Interactive vector chessboard with 5 board themes: **Midnight Luxury** (Flagship Obsidian & Gold), Tournament Emerald, Dark Slate, Glass Ice, and Classic Wood.
  - Double-beveled luxury board frame with violet ambient drop shadow, pulsating last-move gold overlay, selected square neon ring, and animated crimson check alerts.
  - Dynamic SVG arrows with `feDropShadow` glowing filters: vibrant emerald for best moves, crimson/amber for blunders.
  - In-place floating classification badges on destination squares with pop micro-animations.
  - Precision vertical evaluation bar with glass container, advantage tick marks (±5, ±2, 0.00), and floating score pill.
  - High-DPI Bezier spline evaluation flow with Catmull-Rom curvature interpolation, cyan/amethyst gradient fills, and interactive glass hover tooltip.
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
- **Testing**: Vitest (29 unit tests covering UCI, math, classifications, multi-worker engine pool, and tactical positions)
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
