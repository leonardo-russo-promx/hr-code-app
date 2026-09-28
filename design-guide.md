# proMX HR Portal — Design Guide

Brand reference: https://promx.net/en/
Runtime tokens: `src/styles/design-tokens.css` (always use the CSS custom properties — never hardcode values).

## Colour Palette

### Primary Colours
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Primary (proMX teal) | `#00acad` | 0,172,173 | Primary actions, active nav, links, brand accents |
| Primary Light | `#33bdbe` | 51,189,190 | Hover states, highlights |
| Primary Lighter | `#e6f7f7` | 230,247,247 | Selected/hover surfaces, tints |
| Primary Dark | `#008080` | 0,128,128 | Pressed states, on-light emphasis |

### Secondary / Accent Colours
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Secondary (deep teal/slate) | `#1f4e5f` | 31,78,95 | Sidebar, headers, strong emphasis |
| Accent | `#33bdbe` | 51,189,190 | Secondary buttons, chips, KPI accents |

### Neutral / Greyscale
| Name | Hex | Usage |
|------|-----|-------|
| Background | `#f5f6f8` | App canvas |
| Surface | `#ffffff` | Cards, panels |
| Surface Alt | `#f0f1f4` | Table headers, zebra rows |
| Border | `#e3e1e8` | Dividers, card borders |
| Text | `#1f2330` | Primary text |
| Text Muted | `#5b6072` | Secondary text |
| Text Subtle | `#8a8fa0` | Captions, placeholders |

### Semantic Colours
| Name | Hex | Usage |
|------|-----|-------|
| Success | `#2e9e5b` | Approved requests, positive states |
| Warning | `#e8a400` | Submitted/pending states, caution |
| Error | `#d93b3b` | Rejected/cancelled, destructive actions |
| Info | `#2f6feb` | Informational notices |

## Typography

### Font Families
- **Headings:** Inter → Segoe UI → system-ui fallback
- **Body:** Inter → Segoe UI → system-ui fallback
- **Monospace:** Cascadia Code / Consolas

### Type Scale
| Level | Token | Weight | Usage |
|-------|-------|--------|-------|
| H1 | `--text-3xl` (2.25rem) | 700 | Page titles |
| H2 | `--text-2xl` (1.75rem) | 600 | Section headings |
| H3 | `--text-xl` (1.375rem) | 600 | Card / subsection headings |
| Body | `--text-base` (1rem) | 400 | Default text |
| Small | `--text-sm` (0.875rem) | 400 | Labels, table cells |
| Caption | `--text-xs` (0.75rem) | 500 | Metadata, chips |

## Logo Usage
- proMX wordmark; maintain clear space of at least the cap-height around the logo.
- Use full-colour on light surfaces; reversed (white) on the deep-teal sidebar.

## Spacing & Layout

### Spacing Scale
`--space-xs` 4px · `--space-sm` 8px · `--space-md` 16px · `--space-lg` 24px · `--space-xl` 36px · `--space-2xl` 54px

### Grid System
- Max content width: 1200px (`--content-max-width`)
- Sidebar width: 248px · Top bar height: 64px

### Breakpoints
| Name | Min Width | Behaviour |
|------|-----------|-----------|
| Mobile | 0 | Single column; sidebar collapses to top/hamburger |
| Tablet | 768px | Two-column KPI grid |
| Desktop | 1024px | Persistent left sidebar, multi-column content |
| Wide | 1440px | Centered content at max width |

## Components

### Buttons
- Radius `--radius-md`; padding `--space-sm var(--space-md)`.
- Primary: teal background, white text; hover → `--color-primary-light`; active → `--color-primary-dark`.
- Secondary: transparent with border `--color-border`, text `--color-text`.

### Cards
- Surface background, `--radius-lg`, `--shadow-sm`, padding `--space-lg`, 1px `--color-border`.

### Navigation
- Pattern: persistent left sidebar (deep teal) with white icons/labels; active item highlighted with primary teal.
- Mobile: collapses to a top bar with a drawer.

### Status Badges (holiday request statuscode)
| Status | Colour |
|--------|--------|
| Approved | Success |
| Submitted / Cancellation Requested | Warning |
| Rejected / Cancelled | Error |
| Draft | Neutral (text-muted) |

## Information Architecture
- Flat navigation, 5 destinations: **Home**, **Absence Requests**, **Holidays**, **FAQ**, **Onboarding**.
- Home is the default landing page with KPI cards + recent requests.
- Accessibility: maintain WCAG AA contrast; teal `#00acad` on white passes for large text/graphical elements — use `--color-primary-dark` for small text on light backgrounds.
