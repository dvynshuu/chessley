# Chessley Workspace Guidelines & Design Standards

## Design System & Anti-Generic Principles
Chessley is an elite grandmaster chess analysis workstation. All UI components, styling, CSS, and layouts must adhere strictly to the craftsmanship standards detailed in [`.agents/skills/design-system/SKILL.md`](./.agents/skills/design-system/SKILL.md) and [`.agents/rules/design-principles.md`](./.agents/rules/design-principles.md).

### Non-Negotiable Aesthetics:
1. **Zero AI Slop**: Absolutely NO radioactive glows (`box-shadow: 0 0 Xpx ...`), NO blurred background radial gradients, and NO 100px pill buttons.
2. **Material Architecture**: Deep carbon obsidian surfaces (`#080a0f`, `#0f121a`, `#151923`, `#1c2230`) with crisp hairline borders (`rgba(255, 255, 255, 0.08)` to `0.14)`).
3. **Tactile Elevation**: Physical directional shadows with top specular highlight (`inset 0 1px 0 rgba(255, 255, 255, 0.08)`).
4. **Typographic Rigor**: `Inter` for proportional text and `JetBrains Mono` with `tabular-nums` for all numeric metrics, scores, FENs, and coordinates.
5. **Brand Gold**: Chessley Champagne Gold (`#c8aa6e`) for focus rings, brand accents, and active indicators.
