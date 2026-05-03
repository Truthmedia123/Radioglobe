---
name: RadioGlobe
description: A premium world-radio explorer and podcast player with a dark-mode-first, tactile studio aesthetic.
colors:
  background: "#070A0F"
  background-soft: "#0D121A"
  surface: "#141A24"
  surface-elevated: "#1C2431"
  surface-muted: "#242D3B"
  primary: "#3DDC97"
  primary-soft: "rgba(61, 220, 151, 0.16)"
  accent: "#7C6CFF"
  accent-soft: "rgba(124, 108, 255, 0.18)"
  warning: "#FFB86B"
  record: "#FF6B6B"
  error: "#FF5D73"
  border: "rgba(255, 255, 255, 0.09)"
  border-strong: "rgba(255, 255, 255, 0.16)"
  text: "#F7F9FC"
  text-secondary: "#A6B0C2"
  text-muted: "#697386"
  on-primary: "#000000"
  white: "#FFFFFF"
  scrim: "rgba(0, 0, 0, 0.8)"
  black: "#000000"
typography:
  display:
    fontFamily: Playfair Display
    fontSize: 38px
    fontWeight: "700"
    lineHeight: 44px
    color: "{colors.text}"
  h1:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 38px
    color: "{colors.text}"
  h2:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 30px
    color: "{colors.text}"
  h3:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 24px
    color: "{colors.text}"
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 22px
    color: "{colors.text}"
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 19px
    color: "{colors.text}"
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 16px
    color: "{colors.text-secondary}"
  data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 16px
    letterSpacing: 0.05em
    color: "{colors.text}"
    textTransform: uppercase
  tab-label:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: "500"
    lineHeight: 14px
    color: "{colors.text-secondary}"
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  xxl: 24px
  xxxl: 32px
  content-padding: 20px
  section-gap: 24px
radii:
  sm: 8px
  md: 12px
  lg: 18px
  xl: 24px
  full: 999px
elevation:
  level-0:
    backgroundColor: "{colors.background}"
  level-1:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    borderWidth: 1px
  level-2:
    backgroundColor: "{colors.surface-elevated}"
    borderColor: "{colors.border}"
    borderWidth: 1px
  level-3:
    backgroundColor: "{colors.surface-muted}"
    borderColor: "{colors.border}"
    borderWidth: 1px
shadows:
  subtle:
    shadowColor: "#000000"
    shadowOffset: { width: 0, height: 2 }
    shadowOpacity: 0.2
    shadowRadius: 4
    elevation: 4
  glow-primary:
    shadowColor: "{colors.primary}"
    shadowOffset: { width: 0, height: 0 }
    shadowOpacity: 0.2
    shadowRadius: 8
    elevation: 4
motion:
  duration-fast: 150ms
  duration-base: 300ms
  duration-slow: 500ms
  easing-standard: cubic-bezier(0.4, 0, 0.2, 1)
  easing-decelerate: cubic-bezier(0, 0, 0.2, 1)
  easing-accelerate: cubic-bezier(0.4, 0, 1, 1)
  transition-image: 200ms
components:
  search-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{radii.full}"
    height: 48px
    paddingHorizontal: 14px
    borderColor: "{colors.border}"
    borderWidth: 1px
  play-button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{radii.full}"
    size: 74px
  play-button-mini:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{radii.full}"
    size: 38px
  play-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{radii.full}"
    size: 34px
  secondary-control:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text}"
    rounded: "{radii.full}"
    size: 48px
  icon-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{radii.full}"
    size: 42px
  station-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{radii.lg}"
    padding: 12px
    borderColor: "{colors.border}"
    borderWidth: 1px
  station-card-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.text}"
    rounded: "{radii.lg}"
    borderColor: "{colors.primary}"
    borderWidth: 1px
  station-avatar:
    backgroundColor: "{colors.surface-muted}"
    rounded: "{radii.md}"
    size: 46px
  station-avatar-active:
    backgroundColor: "{colors.primary}"
  hero-card:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text}"
    rounded: "{radii.xl}"
    padding: 22px
    borderColor: "{colors.border}"
    borderWidth: 1px
  now-playing-card:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text}"
    rounded: "{radii.xl}"
    padding: 22px
    borderColor: "{colors.border}"
    borderWidth: 1px
  artwork-large:
    backgroundColor: "{colors.accent}"
    rounded: "{radii.xl}"
    size: 190px
  mini-player:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text}"
    rounded: "{radii.lg}"
    padding: 10px
    borderColor: "{colors.border}"
    borderWidth: 1px
  mini-player-artwork:
    backgroundColor: "{colors.accent}"
    rounded: "{radii.md}"
    size: 46px
  mode-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{radii.lg}"
    padding: 14px
    borderColor: "{colors.border}"
    borderWidth: 1px
  stat-card:
    backgroundColor: "{colors.surface}"
    rounded: "{radii.lg}"
    padding: 14px
    height: 104px
    borderColor: "{colors.border}"
    borderWidth: 1px
  tool-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{radii.md}"
    height: 74px
    borderColor: "{colors.border}"
    borderWidth: 1px
  tool-button-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    borderColor: "{colors.primary}"
  live-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{radii.full}"
    paddingVertical: 5px
    paddingHorizontal: 10px
  kicker-label:
    textColor: "{colors.primary}"
    typography: "{typography.data}"
  progress-track:
    backgroundColor: "{colors.surface-muted}"
    rounded: "{radii.full}"
    height: 5px
  progress-fill:
    backgroundColor: "{colors.primary}"
    rounded: "{radii.full}"
    height: 5px
  tab-bar-icon-pill:
    backgroundColor: transparent
    rounded: "{radii.full}"
    width: 50px
    height: 34px
  tab-bar-icon-pill-active:
    backgroundColor: "{colors.primary}"
  modal-sheet:
    backgroundColor: "{colors.surface}"
    roundedTopLeft: 20px
    roundedTopRight: 20px
    padding: 24px
  modal-overlay:
    backgroundColor: "{colors.scrim}"
  resume-toast:
    backgroundColor: "{colors.primary-soft}"
    rounded: "{radii.lg}"
    padding: 14px
    borderColor: "{colors.primary}"
    borderWidth: 1px
  button-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{radii.full}"
    paddingVertical: 8px
    paddingHorizontal: 16px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.text}"
    typography: "{typography.caption}"
    rounded: "{radii.full}"
    paddingVertical: 8px
    paddingHorizontal: 16px
    borderColor: "{colors.border-strong}"
    borderWidth: 1px
  podcast-card:
    backgroundColor: "{colors.surface}"
    rounded: "{radii.md}"
    padding: 16px
    borderColor: "{colors.border}"
    borderWidth: 1px
  continue-card:
    backgroundColor: "{colors.surface}"
    rounded: "{radii.lg}"
    padding: 12px
    width: 166px
    borderColor: "{colors.border}"
    borderWidth: 1px
---

# RadioGlobe Design System

## Brand & Style

RadioGlobe is a premium world-radio explorer and on-demand podcast player. Its design language fuses the atmospheric depth of modern music-streaming interfaces with the physicality of vintage broadcast equipment. The result is a dark, immersive canvas where luminescent accents guide the user through a world of 45,000+ live radio stations and podcast feeds.

The aesthetic philosophy is "Studio Noir" — imagine operating a high-end shortwave receiver in a dimly lit control room. Surfaces float like brushed-metal panels, edges catch faint light, and active states glow with the urgency of an ON AIR indicator. Every interaction should feel tactile, as if the user is turning a physical dial or pressing a hardware button.

The app is dark-mode-only. There is no light theme.

## Color Palette

The palette is built on a five-step dark surface scale ranging from near-black to mid-slate. These layered grays create depth without relying on drop shadows.

- **Background (`#070A0F`, `#0D121A`):** The deepest void. Used for the root canvas and the navigation chrome. These hues avoid pure black to preserve a sense of atmosphere and allow subtle surface differentiation.
- **Surfaces (`#141A24` → `#1C2431` → `#242D3B`):** A progressive lift from base cards to elevated panels to muted insets. Each step is deliberately close in value to create a stacked, physical layering effect.
- **Primary — Mint ON AIR (`#3DDC97`):** The signature luminescent green. Used for play buttons, active tab pills, live indicators, progress fills, and link text. Its softened variant (`rgba(61, 220, 151, 0.16)`) is used for active-state card backgrounds and toasts.
- **Accent — Atmospheric Violet (`#7C6CFF`):** Applied to artwork placeholders, the globe illustration, and language immersion features. Its soft variant (`rgba(124, 108, 255, 0.18)`) tints backgrounds for cultural exploration contexts.
- **Warning Amber (`#FFB86B`):** Signals weather-related features and secondary data points on the discovery screen.
- **Record Red (`#FF6B6B`):** A warm red for recording states and buffering indicators. Distinct from the cooler error pink.
- **Error Pink (`#FF5D73`):** Reserved for destructive actions, error states, and cancel affordances.
- **Text (`#F7F9FC` / `#A6B0C2` / `#697386`):** A three-tier text hierarchy — bright white for headlines, warm silver for metadata, and cool gray for disabled or tertiary labels.
- **Borders (`rgba(255,255,255,0.09)` / `rgba(255,255,255,0.16)`):** Semi-transparent white borders replace shadows entirely. The standard weight is barely perceptible; the strong weight is used for globe illustrations and active outlines.

## Typography

The typographic system uses three font families, each assigned a strict purpose.

- **Playfair Display (700):** All editorial headlines — screen titles, station names in the now-playing view, and hero card headers. The serif creates a worldly, journalistic feel that positions radio listening as cultural exploration, not passive consumption. Used at display (38px), h1 (32px), and h2 (24px) scales.
- **Inter (400–600):** The workhorse sans-serif for all functional UI — body text, section headers (h3, 18px semi-bold), labels, button text, search input, and tab labels. Inter's neutrality and extreme legibility on dark backgrounds make it the default for anything that isn't a headline or a data readout.
- **JetBrains Mono (400):** Exclusively for machine-precision telemetry — timecodes on the player progress bar, buffer percentages, "Now Playing" kicker labels, section counts, and episode metadata. The monospace width ensures numerical data columns align perfectly. Always set to uppercase with 0.05em letter-spacing.

All body text uses a minimum line height of 1.375×. Kicker labels (the small green "NOW PLAYING" or "LIBRARY" tags above screen titles) always use the `data` token styled in uppercase.

## Layout & Spacing

The spacing scale is built on a 4px base unit, but the primary rhythm uses the 8–16–24–32 progression. Content areas use a consistent 20px horizontal padding.

- **Content Padding:** 20px horizontal on all scroll views and screen bodies. This creates a generous gutter that prevents text from touching screen edges.
- **Section Gap:** 22–24px vertical separation between major content sections. Sections include a header row (title + action/count) with 12px bottom margin before the content block.
- **Card Gap:** 10–12px between adjacent cards in grids and lists. This tight gap creates visual grouping while the 1px border provides sufficient separation.
- **Component Internal Padding:** Cards use 12–22px internal padding depending on elevation (standard cards: 12px, hero/now-playing cards: 22px).
- **The Tri-Dial Navigation:** The bottom shell is the app's center of gravity. It layers a persistent mini-player above a four-tab icon bar. The chrome uses 6px top padding and 10px bottom padding for compact density. The mini-player floats 16px in from each edge.

## Elevation & Depth

RadioGlobe achieves depth exclusively through surface color stepping and border illumination. Drop shadows are never used.

- **Level 0 — Canvas:** `#070A0F`. The infinite void behind everything.
- **Level 1 — Standard Card:** `#141A24` with 1px `rgba(255,255,255,0.09)` border. Station list items, mode cards, tool buttons, stat cards, search bar.
- **Level 2 — Elevated Card:** `#1C2431` with 1px `rgba(255,255,255,0.09)` border. Hero cards, now-playing panel, mini-player. These sit visually "above" Level 1 through luminosity alone.
- **Level 3 — Inset/Muted:** `#242D3B`. Used for avatar placeholders, progress track backgrounds, and secondary controls. This layer sits "inside" a Level 2 card, creating a recessed feel.
- **Modal Overlay:** `rgba(0,0,0,0.8)` scrim with the modal sheet itself using the `surface` color and a 20px top border-radius.
- **Active State Inversion:** When a card or button enters an active state, its background switches to `primary-soft` and its border to `primary`, flipping the visual hierarchy. Active icon containers fill with solid `primary` and render icons in black.

## Shapes

The shape language is deliberately organic. Corners range from moderately rounded to fully capsule-shaped, rejecting sharp geometry entirely.

- **Full Capsule (`999px`):** Search bars, pill buttons (play, live, resume), tab icon pills, and progress tracks. Anything the user taps as a single atomic action gets maximum rounding.
- **XL (`24px`):** Hero cards, now-playing panel, artwork containers, and podcast hero. The most prominent, "device casing" level containers.
- **LG (`18px`):** Standard list cards (station items, mode cards, mini-player, continue-listening cards, stat cards). The default for interactive rows.
- **MD (`12px`):** Tool grid buttons, avatar thumbnails, podcast artwork insets, and modal content areas. Used for smaller, dense interactive targets.
- **SM (`8px`):** Source badges, EQ preset buttons, and duration selectors inside modals. The tightest rounding, reserved for compact inline elements.

### Action Elements

The primary play button is a 74px circle filled with `primary`, rendering a black play/pause icon at 30px. The mini-player play button scales down to 38px. Station-list play pills are 34px. All use `full` rounding and the `on-primary` (black) icon color. Secondary controls (skip back/forward) are 48px circles in `surface-muted`.

### Cards & Lists

Station cards and podcast rows use a consistent pattern: `surface` background, `lg` rounding, 12px padding, 1px `border`, with a left-aligned 46px avatar (rounded `md`, filled with `surface-muted`), a text column, and a trailing action. Active items swap to `primary-soft` background and `primary` border. The "Live" pill is an inline capsule badge with green background and black text.

### Tool Grid

The player screen's tool grid uses a 4-across wrapped layout with 10px gap. Each cell is 23% width, 74px height, rounded `md`, with `surface` background and a centered icon + caption layout. Active tools (e.g., recording, ad-break) fill with `primary` and invert to black icons and text. Disabled tools reduce to 45% opacity.

### Modals & Sheets

Bottom sheets slide up with a 20px top border-radius, `surface` background, and a 1px `rgba(255,255,255,0.1)` header separator. The overlay uses `rgba(0,0,0,0.8)`. Centered modals (sleep timer) use 16px radius, 80% max-width, and 24px internal padding.

## Do's and Don'ts

- **Do** use the three-tier text color system (`text` → `text-secondary` → `text-muted`) to establish information hierarchy. Headlines and active labels use `text`; metadata uses `text-secondary`; disabled, tertiary, or placeholder text uses `text-muted`.
- **Do** use the `data` typography token (JetBrains Mono, uppercase, letter-spaced) for all kicker labels, timecodes, and counts. This creates a consistent "telemetry" sub-language that signals precision.
- **Do** give every card and interactive surface a 1px border. Borders, not shadows, define edges in this system.
- **Don't** use drop shadows or box shadows to create elevation. All depth comes from surface color progression and border illumination.
- **Don't** use the `primary` green for large background fills on content areas. It is strictly for interactive affordances (buttons, pills, progress fills, active states). Large green areas destroy the dark-mode atmosphere.
- **Don't** mix serif and sans-serif within the same text block. Playfair Display is only for standalone headlines; all supporting copy uses Inter.
- **Don't** use sharp corners (0px radius) on any visible element. The minimum radius in this system is `sm` (8px).
