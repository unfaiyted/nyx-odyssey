# Odyssey — Branding & Theme Guide

## Logo & Favicon
- **Mark:** White "O" on rounded-rect violet background
- **Files:** `public/favicon.svg` (source), `.ico`, `-16x16.png`, `-32x32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`

## Color Palette

All colors defined as CSS custom properties in `src/styles.css` under `@theme`.

### Core
| Token | Hex | Usage |
|-------|-----|-------|
| `ody-bg` | `#0a0a0f` | Page background |
| `ody-surface` | `#13131a` | Cards, panels |
| `ody-surface-hover` | `#1a1a24` | Hover states |
| `ody-surface-raised` | `#1e1e2a` | Elevated elements, modals |
| `ody-border` | `#2a2a3a` | Default borders |
| `ody-border-subtle` | `#1f1f2e` | Subtle dividers |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `ody-text` | `#e4e4ed` | Primary text |
| `ody-text-muted` | `#8888a0` | Secondary/supporting text |
| `ody-text-dim` | `#555570` | Placeholder, disabled |

### Accent & Status
| Token | Hex | Usage |
|-------|-----|-------|
| `ody-accent` | `#8b5cf6` | Primary accent (violet-500) |
| `ody-accent-hover` | `#a78bfa` | Accent hover (violet-400) |
| `ody-accent-glow` | `rgba(139,92,246,0.3)` | Glow effects |
| `ody-success` | `#22c55e` | Success states |
| `ody-warning` | `#f59e0b` | Warnings |
| `ody-danger` | `#ef4444` | Errors, destructive |
| `ody-info` | `#3b82f6` | Informational |

### Extended Palette (for charts, tags, categories)
Use Tailwind's built-in violet/purple/indigo scale for variety:
- `violet-400` (#a78bfa) — highlights
- `purple-400` (#c084fc) — secondary category
- `indigo-400` (#818cf8) — tertiary category
- Keep chart colors within the violet–blue range for cohesion

## Typography
- **Font:** Inter (Google Fonts), fallback: `system-ui, sans-serif`
- **Weights:** 400 (body), 500 (labels), 600 (headings), 700 (hero/emphasis)
- **Scale:** Use Tailwind defaults (`text-sm`, `text-base`, `text-lg`, `text-xl`, etc.)

## Glass Effect
The app uses glassmorphism for overlays:
```css
background: var(--color-ody-surface-glass);
backdrop-filter: blur(12px);
border: 1px solid var(--color-ody-border);
```

## Icon Style
- Use [Lucide React](https://lucide.dev/) icons throughout
- Size: `w-4 h-4` inline, `w-5 h-5` in buttons, `w-6 h-6` in headers
- Color: inherit from text color or use accent

## Component Patterns
- **Cards:** `bg-ody-surface border border-ody-border rounded-xl p-4`
- **Buttons (primary):** `bg-ody-accent hover:bg-ody-accent-hover text-white rounded-lg px-4 py-2`
- **Buttons (secondary):** `bg-ody-surface-hover border border-ody-border text-ody-text rounded-lg`
- **Inputs:** `bg-ody-bg border border-ody-border text-ody-text rounded-lg focus:border-ody-accent`

## Do's and Don'ts
- ✅ Use `ody-*` tokens for all theme colors
- ✅ Keep within violet/purple/indigo family for accents
- ✅ Use Inter font consistently
- ❌ Don't use raw hex colors — use tokens
- ❌ Don't mix warm and cool accent colors
- ❌ Don't use light backgrounds in dark theme areas
