---
name: design-system
description: >-
  Chessley Grandmaster Workstation Design System & Anti-Generic Craftsmanship Standards.
  Use whenever designing, modifying, or auditing UI components, styling, CSS variables,
  typography, layouts, and animations across Chessley to eradicate AI-generic design cliches
  and enforce executive-level precision craftsmanship.
---

# Chessley Grandmaster Design Principles & Workstation System

Chessley is an elite precision chess analysis workstation powered by Stockfish 19 WASM. It is engineered for grandmasters, tournament competitors, and serious analysts. It is **NOT** a playful consumer toy, a Web3 crypto dashboard, or a boilerplate AI SaaS mockup. 

Every pixel, surface, hairline border, and numeric value must embody the tactile precision, architectural density, and calm authority of a high-end physical laboratory instrument (such as Teenage Engineering, Dieter Rams / Braun, Leica, Linear, and FIDE World Championship match broadcasts).

---

## 1. The Banned "AI Generic" Anti-Patterns (Zero Tolerance)

When creating or modifying components, strictly eradicate these 7 hallmarks of AI-generated frontend slop:

### 1. The "Radioactive Glow & Amorphous Fog" Cliché
- ❌ **Banned**: 
  - `box-shadow: 0 0 20px rgba(124, 58, 237, 0.35)` (purple aura on cards/modals)
  - `box-shadow: 0 0 16px rgba(16, 185, 129, 0.4)` (green neon halos on buttons)
  - `box-shadow: 0 0 14px rgba(56, 189, 248, 0.65)` (electric cyan glow on squares)
  - Floating background radial gradient blobs (`radial-gradient(circle, rgba(purple)...)`).
- ✅ **Standard**:
  - Directional physical elevation with top-edge specular highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.08)`).
  - Crisp ambient occlusion drop shadows (`0 1px 2px rgba(0,0,0,0.5), 0 8px 24px -4px rgba(0,0,0,0.7)`).
  - Calm, deep, opaque surfaces without nebulous colored smog.

### 2. The "Everything is Frosted Glass" Blur Sprawl
- ❌ **Banned**:
  - Slapping `backdrop-filter: blur(16px)` or `WebkitBackdropFilter` onto every static container, nested card, button, and header.
  - Transparent slates (`rgba(15, 23, 42, 0.72)`) layered on top of other transparent slates, creating muddy contrast and GPU composite churn.
- ✅ **Standard**:
  - Solid, layered carbon obsidian planes (`#080a0f`, `#0f121a`, `#151923`, `#1c2230`).
  - Reserve `backdrop-filter` strictly for true floating overlays (sticky navigation bars with 94%+ opacity and modal scrim backdrops).

### 3. The "Uncontrolled 100px Pill Everywhere" Cliché
- ❌ **Banned**:
  - Rounding action buttons, toolbars, badges, tabs, and panels to `border-radius: 100px` or `border-radius: 9999px`.
- ✅ **Standard**:
  - Architectural radii system matched to element scale:
    - `3px - 4px`: Micro tags, inline classification symbols, table cells.
    - `6px`: Dropdown items, tool buttons, input fields, badge counters.
    - `8px`: Standard action buttons, stats tiles.
    - `10px - 12px`: Workstation panels, chessboard frame, charts.
    - `14px`: Dialogs and modals.

### 4. The "Rainbow Gradient Sweep" Cliché
- ❌ **Banned**:
  - Diagonal gradients (`linear-gradient(135deg, #10b981, #059669)` or `linear-gradient(135deg, #2563eb, #3b82f6)`) splashed across buttons.
  - Gradient text clipping (`background-clip: text`) used gratuitously on normal headings.
- ✅ **Standard**:
  - Confident, solid pigment values.
  - Tactile physical bevels (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 1px 2px rgba(0, 0, 0, 0.4)`).
  - Responsive micro-interactions: physical press (`transform: translateY(1px)`), crisp border brightness shift.

### 5. The "Cheesy Continuous Heartbeat Pulse" Cliché
- ❌ **Banned**:
  - Continuous scaling icons (`@keyframes pulse` with `transform: scale(0.85)`), waving arrows, or ambient breathing buttons.
- ✅ **Standard**:
  - Static composure. Moving elements must communicate actual physical state changes (e.g. discrete evaluation computing tick).
  - Fast, damped physical transitions (`120ms - 200ms cubic-bezier(0.16, 1, 0.3, 1)`).

### 6. The "Muddy Grey or Blinding Neon Text" Cliché
- ❌ **Banned**:
  - Muddy, low-contrast grey copy (`#64748b`) for readable descriptions failing WCAG AA.
  - Using saturated neon cyan (`#38bdf8`) or neon purple (`#c084fc`) as default text colors.
- ✅ **Standard**:
  - High-contrast optical hierarchy:
    - Primary Headings & Critical Scores: `#f8fafc` (98% contrast).
    - Primary Body & Notation: `#e2e8f0` (88% contrast).
    - Secondary Metadata & Coordinates: `#94a3b8` (65% contrast).
    - Subtle Demarcations: `#64748b` (45% contrast, strictly for non-critical indexes).

### 7. The "Color Buffet" Incoherence
- ❌ **Banned**:
  - One modal having a purple shadow, another having indigo, another having cyan, another having fuchsia, with green, amber, and blue buttons scattered arbitrarily.
- ✅ **Standard**:
  - Disciplined, cohesive palette anchored around **Chessley Champagne Gold** (`#c8aa6e`), **Deep Carbon Obsidian** (`#080a0f`), and **Ivory White** (`#f8fafc`).
  - Semantic colors (Emerald, Crimson, Amber, Sapphire) are reserved exclusively for chess move classifications (Brilliant, Blunder, Inaccuracy, Best Move) and actual engine evaluation.

---

## 2. Chessley Design Tokens & Material Architecture

### A. Surface Planes (Deep Carbon Obsidian)
```css
--bg-canvas: #080a0f;        /* Deepest canvas background */
--bg-surface-1: #0f121a;     /* Workstation bays, top navbar, base containers */
--bg-surface-2: #151923;     /* Main cards, panels, modal containers */
--bg-surface-3: #1c2230;     /* Elevated control tiles, input fields, button base */
--bg-surface-hover: #232a3b; /* Interactive hover surface */
--bg-surface-active: #2b3347;/* Active pressed state */
```

### B. Precision Hairline Micro-Borders
```css
--border-subtle: 1px solid rgba(255, 255, 255, 0.06); /* Dividers, row delimiters */
--border-default: 1px solid rgba(255, 255, 255, 0.10); /* Containers, card edges */
--border-hover: 1px solid rgba(255, 255, 255, 0.18);   /* Hovered interactive items */
--border-gold: 1px solid rgba(200, 170, 110, 0.35);    /* Master branding / active move */
--border-focus: 2px solid #c8aa6e;                     /* Keyboard accessibility focus */
```

### C. Master Palettes & Semantic Accents
```css
/* Master Brand */
--gold-primary: #c8aa6e;       /* Chessley Champagne Gold */
--gold-hover: #d4ba82;
--gold-dim: rgba(200, 170, 110, 0.12);

/* Strict Chess Move Classifications */
--eval-brilliant: #10b981;     /* Brilliant move (Emerald) */
--eval-best: #3b82f6;          /* Best engine move (Sapphire) */
--eval-excellent: #60a5fa;     /* Excellent move */
--eval-good: #94a3b8;          /* Good move */
--eval-inaccuracy: #f59e0b;    /* Inaccuracy (Amber) */
--eval-mistake: #f97316;       /* Mistake (Orange) */
--eval-blunder: #ef4444;       /* Blunder / Check (Crimson) */
```

### D. Architectural Elevation & Tactile Lighting
```css
/* Real physical depth with top specular highlight */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
--shadow-md: 0 4px 12px -2px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08);
--shadow-lg: 0 12px 32px -4px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.08);
--shadow-modal: 0 24px 64px -8px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.12);
```

---

## 3. Typographic Hierarchy & Precision Numeric Alignment

- **Proportional Font**: `Inter`, `-apple-system`, sans-serif. Used for UI labels, titles, player names.
- **Tabular Monospace**: `'JetBrains Mono'`, monospace. **Mandatory** for:
  - FEN strings & PGN moves
  - Evaluation scores (`+1.45`, `-0.20`, `M4`)
  - Engine depth, nodes, and NPS
  - Timers, ratings, and move numbers
- **Tabular Numerals**: Always apply `font-variant-numeric: tabular-nums` or the `.tabular-nums` class to prevent numbers from jittering as the engine computes.

---

## 4. Implementation Checklist for New & Refactored Components

Before shipping any component or styling change, verify:
- [ ] Are all `box-shadow` values using neutral dark ambient occlusion instead of colored glow halos?
- [ ] Are all background colors opaque or high-opacity surfaces from the `--bg-surface-*` scale?
- [ ] Are buttons using architectural radii (`6px` or `8px`) rather than 100px pills?
- [ ] Are focus indicators using the crisp gold ring (`outline: 2px solid #c8aa6e; outline-offset: 2px`) without electric cyan bloom?
- [ ] Is tabular data (scores, nodes, move times, ratings) rendered in `JetBrains Mono` with `tabular-nums`?
- [ ] Are transitions short, purposeful, and free of gratuitous continuous looping animations?
