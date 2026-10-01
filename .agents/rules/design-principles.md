# Chessley Design Principles & Anti-AI Slop Rules

These design principles are mandatory across the entire Chessley codebase. Every agent, developer, and automated refactor must strictly adhere to these rules without exception.

---

## 1. Absolute Zero-Tolerance for AI Generic Design Tropes

1. **NO Radioactive Glows or Blurred Smog**:
   - Never use colored `box-shadow` glows (`0 0 20px rgba(purple, 0.4)`, `0 0 16px rgba(green, 0.4)`).
   - Never put floating radial gradient blur blobs in page backgrounds or behind icons.
   - Use physical directional elevation with top specular highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.08)`).

2. **NO Gratuitous Backdrop Blur Sprawl**:
   - Do not slap `backdrop-filter: blur(16px)` on static containers, nested cards, buttons, or list items.
   - Use solid, architecturally layered carbon surfaces (`#080a0f`, `#0f121a`, `#151923`, `#1c2230`).
   - Reserve backdrop filters strictly for true floating overlays (sticky navbar, modal scrim).

3. **NO 100px Pills or Squircle Sprawl**:
   - Never use `border-radius: 100px` or `border-radius: 9999px` on action buttons, cards, or workspace bays.
   - Strictly follow architectural radii: `4px` (micro tags), `6px` (tool controls/inputs), `8px` (buttons), `10px-12px` (cards/board), `14px` (modals).

4. **NO Rainbow Diagonal Button Gradients**:
   - Never use `linear-gradient(135deg, ...)` on buttons or text headers.
   - Use confident, solid pigment values with tactile top bevels (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 1px 2px rgba(0, 0, 0, 0.4)`).

5. **NO Continuous Looping Animations / Heartbeat Pulses**:
   - Do not use continuous pulse animations on buttons, badges, or icons.
   - Micro-animations must only trigger on discrete user actions or real-time engine calculation state changes.

6. **NO Low-Contrast Muddy Text**:
   - Maintain strict WCAG AA+ contrast: `#f8fafc` for primary headers, `#e2e8f0` for body copy, `#94a3b8` for secondary descriptors.
   - Never use unreadable washed-out greys (`#64748b`) for body paragraphs.

7. **Mandatory Tabular Alignment**:
   - All chess scores, FENs, move numbers, clock times, nodes, NPS, and depths must use `JetBrains Mono` and `tabular-nums`.

---

## 2. Design System Reference
Always cross-reference and verify components against the full design system documentation in [`.agents/skills/design-system/SKILL.md`](../skills/design-system/SKILL.md).
