# Aptitude Website Design System

This file documents the current design language for the Aptitude website. Treat `src/app/globals.css` as the implementation source of truth for tokens and global behavior. `tailwind.config.ts` is retained for tooling compatibility only and contains stale illustrative values; do not use it as the active theme source.

## Brand Direction

Aptitude should feel like governed infrastructure for AI systems: precise, restrained, technical, and trustworthy. The interface is not a marketing brochure first. It should prioritize scannable information, compact controls, clear state, and a strong product signal through the Aptitude mark and registry-oriented content.

Design principles:

- Use the brand purple sparingly but decisively for identity, focus, primary actions, score highlights, and active state.
- Keep surfaces dark or warm-light depending on theme; avoid neon treatments, heavy 3D, and decorative color noise.
- Prefer dense, organized layouts over oversized cards or purely decorative sections.
- Use uppercase mono labels for operational metadata and section framing.
- Use icon-only controls when the action is familiar and an accessible label or tooltip is present.
- Keep radii tight. Use `4px`, `8px`, and the existing `10px` navigation affordances before introducing larger rounding.

## Source Files

- Global tokens and most page-level styles: `src/app/globals.css`
- Root layout, favicon data URL, header, footer: `src/app/layout.tsx`
- Brand SVG component: `src/components/icons/brand-mark-icon.tsx`
- Static brand assets: `public/logo.svg`, `public/logo.png`
- Shared shadcn/Radix UI primitives: `src/components/ui/*`
- shadcn configuration: `components.json`
- Package manager and libraries: `package.json`

## Typography

### Font Stacks

The site does not currently load remote font files. All font stacks are system/local fallbacks defined in CSS variables.

| Token | Stack | Usage |
| --- | --- | --- |
| `--font-display` | `Impact, Haettenschweiler, "Arial Black", sans-serif` | Hero-scale uppercase display headings. |
| `--font-body` | `"Helvetica Neue", Helvetica, Arial, sans-serif` | Body copy, forms, descriptions, cards, long-form content. |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace` | Navigation, metadata, labels, badges, compact operational text. |
| `--font-instrument` | Same as mono stack | Reserved alias currently mapped to mono. |

### Type Usage

- Hero titles use `--font-display`, `font-weight: 900`, uppercase, `letter-spacing: 0`, and tight line height around `0.88`.
- Body copy uses `--font-body`, normal casing, comfortable line height around `1.6`.
- Eyebrows, section labels, badges, tags, metadata labels, breadcrumbs, microcopy, and panel titles use `--font-mono`, uppercase, `font-weight: 700`.
- Navigation uses `--font-mono`, uppercase, small size, and wider tracking.
- Do not scale font size directly with viewport width outside established `clamp(...)` rules.
- Keep letter spacing non-negative. Existing headings use `0`; metadata uses positive tracking.

Recommended sizes already in use:

- Hero title: `clamp(4rem, 7.8vw, 6.8rem)`
- Hero/body description: `clamp(1rem, 1.6vw, 1.28rem)`
- Section/eyebrow labels: `0.72rem`
- Footer/nav utility text: about `0.68rem` to `0.82rem`
- Button text in shared UI primitives: `text-sm`, with smaller variants for compact controls

## Color Palette

The site supports dark, light, and auto theme behavior. The default `:root` is dark; explicit `:root[data-theme="light"]` and `:root[data-theme="dark"]` override the palette.

### Brand Colors

| Role | Value | Notes |
| --- | --- | --- |
| Brand purple | `#a406bc` | Canonical logo purple from `public/logo.svg`. Use this when matching the mark exactly. |
| Dark theme accent | `#b319cf` | Active UI accent in dark mode. Slightly brighter than the logo purple for contrast. |
| Dark accent hover | `#d35de5` | Hover/highlight tone in dark mode. |
| Light theme accent | `#a406bc` | Canonical purple in light mode. |
| Light accent hover | `#7b048d` | Deeper hover tone in light mode. |
| Logo cream | `#fff7ed` | Logo inner fill and active icon foreground. |

### Dark Theme Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--bg-base` | `#11100f` | Page background. |
| `--bg-surface` | `#1b181b` | Cards, muted control backgrounds, low-elevation regions. |
| `--bg-elevated` | `#252127` | Popovers, panels, higher-emphasis controls. |
| `--border` | `#3c353c` | Standard border. |
| `--border-strong` | `#66556a` | Higher-contrast border and input edge. |
| `--border-subtle` | `#2a252b` | Quiet separators. |
| `--text-primary` | `#f6efe2` | Primary text. |
| `--text-muted` | `#ddd5c8` | Secondary readable text. |
| `--text-dim` | `#9e94a3` | Metadata and subdued labels. |
| `--accent` | `#b319cf` | Primary accent and active state. |
| `--accent-hover` | `#d35de5` | Accent hover and highlights. |
| `--red` | `#ff6b5c` | Error/destructive. |
| `--blue` | `#5b9ef0` | Informational chart/support color. |
| `--warn` | `#f2c94c` | Warning/support color. |

### Light Theme Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--bg-base` | `#fff9f2` | Page background. |
| `--bg-surface` | `#fffdf8` | Cards and panels. |
| `--bg-elevated` | `#f7efe5` | Elevated controls and muted regions. |
| `--border` | `#ece0d2` | Standard border. |
| `--border-strong` | `#dacade` | Higher-contrast border and input edge. |
| `--border-subtle` | `#f0deca` | Quiet separators. |
| `--text-primary` | `#241324` | Primary text. |
| `--text-muted` | `#5a435f` | Secondary readable text. |
| `--text-dim` | `#846889` | Metadata and subdued labels. |
| `--accent` | `#a406bc` | Primary accent and active state. |
| `--accent-hover` | `#7b048d` | Accent hover and highlights. |
| `--red` | `#b32b23` | Error/destructive. |
| `--blue` | `#1f6ab2` | Informational chart/support color. |
| `--warn` | `#976500` | Warning/support color. |

### Semantic shadcn Token Mapping

The global CSS maps the custom palette into shadcn-compatible CSS variables:

- `--background` -> `--bg-base`
- `--foreground` -> `--text-primary`
- `--card` -> `--bg-surface`
- `--popover` -> `--bg-elevated`
- `--primary` -> `--accent`
- `--secondary` and `--muted` -> `--bg-elevated`
- `--destructive` -> `--red`
- `--input` -> `--border-strong`
- `--ring` -> `--accent`
- `--chart-1` through `--chart-5` -> accent, blue, green, warn, text-dim

## Logo System

### Primary Mark

Use the Aptitude geometric mark from:

- SVG asset: `public/logo.svg`
- PNG asset: `public/logo.png`
- React component: `src/components/icons/brand-mark-icon.tsx`
- Favicon data URL: generated inline in `src/app/layout.tsx`

Logo colors:

- Outer shape and counter: `#a406bc`
- Inner A-shape: `#fff7ed`

Header usage:

- Mark size: `30px` wide by `34px` high.
- The mark has a subtle purple drop shadow and `logoFloat` animation.
- It is paired with the wordmark text `Aptitude Registry`.
- `Aptitude` is colored with `--accent`; `Registry` uses `--text-muted`.

Logo guidance:

- Do not recolor the mark except for explicitly monochrome contexts.
- Do not replace the cream inner fill with pure white unless the surrounding system requires it.
- Keep enough padding around the mark so the angled outer shape remains legible.
- Use the SVG/component for UI. Use PNG only where SVG is not supported.

## Icon Family

Primary icon family: Lucide React.

Configuration:

- `components.json` sets `"iconLibrary": "lucide"`.
- `package.json` includes `lucide-react`.
- Current Lucide usage includes search, clear, loading, clipboard, check, alerts, pagination, and empty states.

Custom icons:

- `BrandMarkIcon` is custom SVG and should remain the only brand mark source in React.
- `StarIcon` is custom SVG for saved/starred state.
- Some header action icons are currently inline SVG. For new familiar actions, prefer Lucide icons unless a custom shape is needed.
- Flow diagrams use custom SVG paths and React Flow handles because they are product-specific visuals, not generic UI icons.

Icon style:

- Stroke-based icons should use `currentColor`.
- Default stroke width is generally `2`.
- Small UI icons usually render around `15px` to `19px`; shared button icons use shadcn defaults around `16px`.
- Icon-only actions need `aria-label`, `title`, or a tooltip.

## Layout and Spacing

Global layout tokens:

| Token | Value | Usage |
| --- | --- | --- |
| `--page-max` | `1240px` | Max content width for header, main, footer. |
| `--page-gutter` | `clamp(18px, 4vw, 64px)` | Horizontal page padding. |
| `--radius-sm` | `4px` | Small labels, focusable utility elements, tooltips. |
| `--radius-md` | `8px` | Core UI radius. |
| `--radius` | `0.625rem` | shadcn base radius token. |

Page shell:

- Header is sticky and sits at the top with `z-index: 50`.
- Main content width is `min(var(--page-max), 100%)`.
- Main top/bottom padding uses responsive clamps.
- Footer is transparent and compact.
- Body background combines subtle radial accent glows, a faint grid, a vertical accent wash, and the base color.

Spacing guidance:

- Use `clamp(...)` for large section gaps and responsive padding.
- Keep interactive control dimensions stable.
- Favor full-width sections and constrained inner content over nested card shells.
- Avoid card-in-card layouts unless the nested item is a true repeated data item or modal surface.

## Surfaces, Radius, and Shadows

Core surface hierarchy:

1. Page background: `--bg-base`
2. Standard surface/card: `--bg-surface`
3. Elevated surface/popover/control: `--bg-elevated`
4. Accent state: `--accent-dim`, `--accent-glow`, `--accent`

Shadow tokens:

- `--shadow-panel`
  - Dark: `0 24px 80px rgb(var(--shadow-rgb) / 0.36)`
  - Light: `0 24px 70px rgb(var(--shadow-rgb) / 0.14)`
- `--shadow-search`
  - Dark: `0 18px 48px rgb(var(--shadow-rgb) / 0.22)`
  - Light: `0 10px 28px rgb(var(--shadow-rgb) / 0.08)`

Surface guidance:

- Use borders and subtle inset highlights before heavy shadows.
- Keep hover lift small, typically `translateY(-2px)`.
- Avoid dominant purple backgrounds; prefer neutral surfaces with purple as state and focus.
- Use `rgb(var(--*-rgb) / alpha)` for transparent variants instead of hard-coded rgba values when possible.

## Buttons and Controls

Shared button primitive: `src/components/ui/button.tsx`.

Button variants:

- `default`: accent background, active primary action.
- `outline`: bordered neutral action.
- `secondary`: elevated neutral action.
- `ghost`: quiet inline action.
- `destructive`: low-opacity red destructive action.
- `link`: text link action.

Button sizes:

- `default`: `h-8`, compact horizontal padding.
- `xs`: `h-6`
- `sm`: `h-7`
- `lg`: `h-9`
- `icon`: `size-8`
- `icon-xs`: `size-6`
- `icon-sm`: `size-7`
- `icon-lg`: `size-9`

Control guidance:

- Prefer icon buttons for familiar actions like copy, clear, theme, login/logout, docs, and pagination.
- Pair unfamiliar icon-only controls with tooltips.
- Use focus rings from `--ring`/`--accent`; do not suppress focus outlines.
- Disabled controls should be visually muted and non-interactive.
- Keep button text short. If text wraps inside a button, revisit label length or control layout.

## Forms and Inputs

Form design should look production-ready even when authentication is stubbed.

Patterns:

- Use real-looking email/password fields.
- Keep labels visible or available to assistive tech.
- Use `--border-strong` for input edges.
- Use `--accent` for focus state.
- Use `--red` for invalid or destructive state.
- Use compact helper text and avoid exposing implementation details in the UI.

Login-specific cues:

- Status dot uses `--login-status-base`, `--login-status-highlight`, `--login-status-ring`, and `--login-status-glow`.
- Login panel uses the panel shadow token and a restrained elevated surface treatment.

## Cards, Panels, and Lists

Shared card primitive: `src/components/ui/card.tsx`.

Base card behavior:

- Flex column layout.
- `rounded-xl` in the shadcn primitive, while broader design guidance prefers `8px` or tighter where practical.
- Background uses `--card` / `--bg-surface`.
- Border/ring uses foreground transparency or theme border variables.
- Padding defaults to compact `py-4`, with `sm` using `py-3`.

Registry-specific cards:

- Skill cards should be compact, scannable, and data-forward.
- Card hover may lift slightly and strengthen border/accent treatment.
- Badges and tags use mono uppercase labels.
- Metadata panels and relationship panels use neutral surfaces, not saturated brand fills.

Empty and error states:

- Use `Alert` for error/empty messages where appropriate.
- Use Lucide icons like `AlertCircle` and `SearchX`.
- Error color should come from `--red`/`--destructive`.

## Badges, Tags, and Metadata

Use uppercase mono text for operational metadata:

- Eyebrows
- Section labels
- Metric labels
- Panel titles
- Breadcrumbs
- Badges
- Tags
- Microcopy

Guidance:

- Tags should be short and scan-friendly.
- Badges should communicate state, not decoration.
- Keep published/deprecated/archived states distinct through color and text.
- Avoid long badge labels that force layout shifts.

## Data Visualization and Diagrams

Current visual systems:

- Score donuts in the catalog/detail pages.
- React Flow powered hero/workflow visuals via `@xyflow/react`.
- Custom workflow SVG paths in landing flows.
- Chart variables mapped through shadcn chart tokens.

Guidance:

- Use `--chart-1` through `--chart-5` for chart colors.
- Prefer accent for the primary metric, then blue, purple-hover/green alias, warn, and dim text for supporting series.
- Score rings use `--score-track-stroke` and accent-derived progress colors.
- Diagrams should look like operational infrastructure, not decorative illustrations.
- Diagram edges can use purple alpha values, but keep node surfaces neutral.

## Motion

Defined animations:

- `fadeUp`: short entrance from `translateY(8px)` over `0.4s`.
- `softPulse`: status-dot opacity/scale pulse.
- `logoFloat`: small vertical brand-mark float.
- `ambientRise`: subtle page content entrance.
- `scoreDonutFill`: score ring draw animation.

Motion guidance:

- Keep motion subtle and functional.
- Default transitions should be around `120ms` to `180ms`.
- Entrance animations should not delay usability.
- Hover transforms should be small, typically no more than `translateY(-2px)`.

## Accessibility

Baseline practices already present:

- Skip link targets `#main-content`.
- `.sr-only` utility exists for assistive-only labels.
- `:focus-visible` uses a visible accent outline.
- Icon-only nav actions include `aria-label` and/or `title`.
- Search/status areas use live regions where needed.

Requirements for new UI:

- Every icon-only button needs an accessible name.
- Do not use color alone for critical state.
- Preserve visible focus treatment.
- Keep contrast acceptable in both light and dark themes.
- Avoid text overlap at mobile breakpoints.
- Use semantic headings and landmarks.

## Theme Behavior

The root layout reads `localStorage["aptitude-theme-mode"]` before hydration and sets `document.documentElement.dataset.theme` to `light` or `dark` when explicitly selected.

Theme mode control:

- Three-state segmented control: light, dark, auto.
- Active segment uses `--accent`.
- Icons use `--theme-mode-icon`; active state uses `--theme-mode-active-icon`.

New theme-aware styles should:

- Use existing CSS variables rather than hard-coded colors.
- Define both light and dark values if a new token is required.
- Prefer RGB tuple tokens for alpha overlays.

## Implementation Rules

- Add new design tokens in `src/app/globals.css`, not `tailwind.config.ts`.
- Use Tailwind v4 CSS `@theme` variables for custom theme integration.
- Use shadcn/Radix primitives from `src/components/ui/*` when they fit the control.
- Use `lucide-react` for generic icons.
- Use `BrandMarkIcon` for the Aptitude mark in React.
- Use `public/logo.svg` as the static logo source.
- Use `bun` for package scripts.
- Keep design changes scoped and verify responsive behavior in both themes.

## Evaluation Checklist

Before shipping a visible design change:

- Check light and dark theme rendering.
- Check desktop and mobile widths.
- Confirm no text overlaps or clips in controls, cards, and nav.
- Confirm focus states are visible with keyboard navigation.
- Confirm icon-only actions have accessible names.
- Confirm colors come from tokens unless there is a deliberate one-off asset need.
- Confirm new UI matches the existing compact, technical registry tone.
- Run `bun run typecheck` for code changes.
