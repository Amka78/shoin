# Shoin — Design System

A living design reference for Shoin — a cross-platform digital library manager for iOS, Android, Web, and Desktop.

---

## 1. Design Philosophy

### Visual Identity

Shoin should feel **cool and intellectual** — the digital equivalent of a well-curated private library or an architecture monograph. Think: clean lines, deliberate silence, the confidence of a space that doesn't need to shout. The interface earns authority through restraint, not ornamentation.

The visual mood draws from references like:
- Academic and literary journals — sparse, high-contrast, typographically rigorous
- Modernist architecture photography — monochrome, geometric, precise
- Premium editorial design — generous whitespace, structured grids, no decorative noise

### Tone in One Sentence

> *The design is calmer than it is loud, more intellectual than playful, and more confident than friendly.*

### Core Principles

**Washi and ink** — The palette is a monochrome of washi paper (warm off-white), ink (deep warm black), and one accent color: vermilion(朱). The absence of decorative color is the statement: layering is built from thin lines and paper tones, not from hue.

**Vermilion only where it means something** — Accent color is reserved for two contexts: the primary action of a screen and reading-status indicators on book cards. Nothing else gets color.

**Content-first** — Book covers are the primary visual element. Every UI decision should ask: "does this compete with the cover?" If yes, dial it back.

**Typographic hierarchy** — The pairing of a Japanese serif (Noto Serif JP) with a geometric grotesque (Space Grotesk) is deliberately intellectual. Serif for ideas; grotesque for function. The contrast between them carries the design's personality.

**Warm over cold** — The palette leans warm, like paper and ink. Washi backgrounds and ink text read as a calm, editorial space. Avoid cool blue- or green-gray surfaces.

**Honest chrome** — Navigation and controls exist only to serve the content. They should be visually quiet and structurally clear — never decorative, never playful.

**Consistent across surfaces** — The same warm, measured visual identity should be recognizable whether the app is running on an iPhone or a desktop. Layout adapts; character does not.

---

## 2. Color

The palette is **monochrome by design** — washi paper, ink, and vermilion. Near-zero corner radii and zero drop shadows, with thin rules and whitespace carrying the hierarchy. Color appears only where it carries meaning (primary actions, reading status). This is the "Shoin Ink" direction chosen in the 2026-11-15 design refresh (artifacts/design-refresh/mockups.html, 案A).

### 2.1 Palette

The overall hue is **warm**: whites have a faint paper cast, near-blacks are warm ink. Avoid cool blue-gray tones, pure white backgrounds, and pure black text.

| Role | Light (washi) | Dark (night ink) |
|------|-------|------|
| **Background** (`bg0`) | `#F4EFE6` | `#16130E` |
| **Surface** (cards, panels, modals) | `#FBF8F2` | `#1E1A14` |
| **Surface Muted** (subtle containers) | `#F1EBDF` | `rgba(30,26,20,0.72)` |
| **Surface Strong** (elevated, sidebar) | `#EEE7DA` | `#262019` |
| **Text Primary** | `#1B1712` | `#EAE4D9` |
| **Text Secondary** (metadata, captions) | `#6F6558` | `#A69D8E` |
| **Text Tertiary** (faint labels) | `#9B9081` | `#7E7566` |
| **Border Subtle** (dividers, inputs) | `#DED3C1` | `#3A352C` |
| **Border Strong** (visible outlines) | `#C7B9A1` | `#4A4439` |
| **Accent (vermilion)** | `#B0392A` | `#C95B4A` |
| **Accent Ink** (text on accent) | `#FBF5EC` | `#1A1510` |
| **Accent Soft** (selected row bg) | `rgba(176,57,42,0.09)` | `rgba(201,91,74,0.14)` |

**Corner radii**: 2 / 3 / 5 px (`$xs`–`$lg` in the gluestack config override). Pill shapes (`$full`) are limited to small badges. **Shadows**: none — hierarchy comes from `borderSubtle` rules and paper-tone layers.

Background gradients flow softly top-to-bottom (`bg0 → surfaceMuted`) to give depth without decoration. They reinforce the warm washi atmosphere; never use saturated or cool-toned gradients.

### 2.2 Reading Status Colors

These are the **only** saturated colors in the system, and they are reserved exclusively for reading-status indicators on book cards.

| Status | Color | When to use |
|--------|-------|-------------|
| Want to Read | `#3B82F6` | Badge icon on book card |
| Reading | `#F97316` | Badge icon on book card |
| Finished | `#22C55E` | Badge icon on book card |

> **Rule**: These three status colors must not appear anywhere outside of reading-status contexts — not in buttons, alerts, tags, or highlights. The single extra use of color is **vermilion (accent)**, reserved for the primary action of a screen and for selection states; it is never used for error messages or decoration.

### 2.3 Dark Mode

Dark mode is the **night ink** extension of the same identity: warm near-black surfaces (not blue-black, not charcoal) with paper-white text and a brighter vermilion accent (`#C95B4A`) for legibility. Surfaces carry slight transparency to allow layer depth to show through. In dark mode, the app should feel like a quiet reading room — high contrast where it matters, ink-dark everywhere else.

---

## 3. Typography

Two typefaces, each with a clear domain. Their contrast — classical serif meets geometric grotesque — is the primary source of the app's intellectual character:

| Family | Domain | Why |
|--------|--------|-----|
| **Noto Serif JP** | Content — titles, headings, descriptions, book-related copy | Classical serifs carry intellectual weight; strong CJK coverage for Japanese and Korean titles; the letterforms reference print media and academia |
| **Space Grotesk** | Interface — labels, buttons, metadata, navigation, form fields | A precise, geometric grotesque. Cool rather than friendly. Pairs with the serif by contrast — one is literary, the other architectural |

**The rule is simple**: if it's about a book, use Noto Serif JP. If it's about the app, use Space Grotesk.

The pairing should read as **rigorous, not playful**. Both families are chosen for structure and legibility, not personality or warmth.

### Scale

| Context | Size | Weight | Family |
|---------|------|--------|--------|
| Screen / section heading | Large (`$xl`–`$2xl`) | Bold | Noto Serif JP |
| Book title on card | Medium (`$md`) | Medium | Noto Serif JP |
| Book title on detail screen | Large (`$xl`) | SemiBold | Noto Serif JP |
| Author / series name | Small (`$sm`) | Regular | Space Grotesk |
| Metadata fields (date, format, size) | Small (`$sm`) | Regular | Space Grotesk |
| Button label | Small (`$sm`) | SemiBold | Space Grotesk |
| Badge / caption | Extra-small | Regular | Space Grotesk |

Never mix both families within a single text element. Never hardcode font names in components — reference `typography.primary` and `typography.secondary` from `app/theme`.

---

## 4. Spacing & Layout

Base unit: **4 px**. All spacing values are multiples of this unit.

| Value | Common use |
|-------|-----------|
| 4 px | Tight icon padding, badge insets |
| 8 px | Gap between inline elements |
| 12 px | List item vertical padding |
| 16 px | Standard screen horizontal margin |
| 24 px | Between sections |
| 32 px | Large block separations, hero areas |

### Responsive Layout

The app has two layout modes, toggled by `useConvergence().isLarge`:

**Compact** (phone): single-column screens, bottom tab navigation, floating action button at bottom-right.

**Large** (tablet / desktop): multi-column grid in the library, persistent left sidebar, action controls shift to top-right.

Library grid density:
- Compact: 2 columns
- Large: 4–6 columns (adapts to window width)

Book detail: full-screen on compact, right-panel overlay on large.

### Safe Area

All interactive elements and content must respect device safe areas. Bottom-edge FABs and navigation bars account for `insets.bottom` automatically.

---

## 5. Iconography

Source: **Material Community Icons**, wrapped in the app's `MaterialCommunityIcon` component.

| Size | Approx | Use |
|------|--------|-----|
| `sm` | 16 px | Reading-status badges, inline indicators |
| `md-` | 20 px | Toolbar secondary actions |
| `md` | 24 px | Standard toolbar icons |
| `lg` | 32 px | Empty-state illustrations |

Icon color defaults to the text primary color of its context. Use reading-status colors only on status badge icons. Inactive or disabled icons use text secondary.

---

## 6. Key UI Patterns

### 6.1 Book Card

The cover is the hero. Text and overlays are minimal. Interaction reveals depth progressively.

```
┌────────────────┐
│                │
│  [status icon] │  ← top-right, 20 px, color-coded
│                │
│  [hover menu]  │  ← visible on web hover / native long-press only
│                │
│ ████░░░░░░░░░░ │  ← reading progress bar, 3 px, bottom edge
└────────────────┘
  [○]               ← selection checkbox, visible in multi-select mode only
```

- Progress bar fill: accent (vermilion); track: surface muted
- Hover/long-press menu: `surfaceStrong` background, no shadow — border separation only
- Selected state: accent-colored checkbox, subtle border on card

### 6.2 Book Metadata Display

Book metadata (author, series, tags, format, date) should be visually subordinate to the title and cover.

```
[Cover]   BOOK TITLE                ← Noto Serif JP, large, primary
          Author Name               ← Space Grotesk, small, secondary
          Series · Vol. 3           ← Space Grotesk, small, secondary
          ★★★★☆                    ← Rating component
          epub · 2.4 MB · 2023     ← Space Grotesk, caption, secondary
```

Tags are displayed as small monochrome chips — never colorful labels.

### 6.3 Buttons

Color is reserved for the primary action only. Emphasis is expressed through fill, not hue — except for the one vermilion primary.

| Variant | Appearance | Use |
|---------|-----------|-----|
| `outline` | Transparent background, `borderStrong` border | Default action |
| `solid` | Filled with **accent (vermilion)**, `accentInk` text | Primary / emphasized action |

A `solid` button is vermilion (light: `#B0392A`, dark: `#C95B4A`). There is only one solid per screen; secondary actions stay outline.

### 6.4 Header & Navigation

- Fixed header height: 50 px
- Background: surface strong
- Separator: 1 px border subtle, bottom edge
- Left sidebar (large layout): always visible, 240–280 px wide, surface background
- Left sidebar (compact): slide-in drawer on demand

### 6.5 Modals & Popovers

- Background: surface, 5 px border radius
- Border: border subtle
- Backdrop: `rgba(0, 0, 0, 0.4)`
- Entry animation: fade + 8 px upward slide, 300 ms ease-out

---

## 7. UI States

Every screen or component that loads data must handle all four states:

### Loading
Use a subtle spinner or skeleton — never a full-screen block. For the library grid, render skeleton cards at the same size as real cards to prevent layout shift.

### Empty
Empty states should feel human, not mechanical. Use a large icon (32 px+) from Material Community Icons paired with a brief, friendly message in Noto Serif JP. Offer a clear primary action (e.g., "Connect to a Calibre server").

### Error
Display errors inline, not as modal interruptions. Error text uses accent (vermilion) — it is the one permitted use of the accent for state, alongside primary actions. Offer a retry action using an `outline` button.

### Success / Confirmation
Avoid success toasts for routine actions (downloads, saves). Use them only for actions that take more than 2 seconds or could fail silently. Keep duration to 2–3 seconds.

---

## 8. Motion

One timing token: **300 ms ease-out**. Applied consistently to all transitions.

| Pattern | Use |
|---------|-----|
| Fade + 8–12 px slide up | Panel, modal, drawer entry |
| Fade only | Overlay show/hide (viewer controls) |
| Staggered fade | Multiple items entering together (40 ms delay per item) |
| None | List scroll, image load, page turn (native behavior preferred) |

**Do not use** spring or bounce animations. They imply playfulness that conflicts with the calm reading environment.

---

## 9. Reading Experience (Viewer)

The viewer is the most important screen. Design for distraction-free reading.

**Default state**: full-screen, zero chrome. Only the content is visible.

**On tap**: header and optional footer fade in (300 ms). Tap again or wait 4 seconds to hide.

**Header contents**: back arrow + truncated book title + overflow menu for viewer settings. Nothing else.

**Reading background**: always `bg0`. No "sepia" or tinted modes by default — the system dark/light mode handles this. Custom reading themes can be a future addition.

**Progress**: shown as a slim bar at the bottom of the screen (not a floating badge or percentage label).

| Format | Approach |
|--------|---------|
| PDF | Preserve original page layout; do not reflow |
| HTML/EPUB | Inject minimal CSS: font, background, and text color from the active palette |

---

## 10. Accessibility & Internationalization

### Accessibility
- All interactive elements: minimum 44×44 px touch target
- Text contrast: WCAG AA minimum (4.5:1 for body, 3:1 for large text)
  - Light `#1B1712` on `#F4EFE6` ≈ 15.6:1 ✅
  - Dark `#EAE4D9` on `#16130E` ≈ 14.9:1 ✅
- Do not suppress focus rings on web
- Meaningful `accessibilityLabel` on all icon-only buttons

### Internationalization

| Locale | Writing system | Direction |
|--------|---------------|-----------|
| English (en) | Latin | LTR |
| Korean (ko) | Hangul | LTR |
| Arabic (ar) | Arabic | **RTL** |

For RTL: avoid hardcoding `left`/`right`. Use `start`/`end` flex properties and Gluestack's RTL-aware layout props. The left sidebar becomes a right sidebar in RTL automatically.

Noto Serif JP covers Latin, Japanese, and Korean at all weights. Arabic falls back to the system serif (Noto Naskh on most platforms).

---

## 11. What to Avoid

| ❌ Don't | ✅ Do instead |
|---------|-------------|
| Colorful, multi-hue primary buttons | `solid` button — vermilion only |
| Cool blue-gray / steel surfaces | Washi paper and ink tones only |
| More than one accent color | One accent: vermilion (primary actions, selection, reading status) |
| Drop shadows on cards | Border separation (`borderSubtle`) |
| Decorative / saturated gradients | Background wash gradients only, washi-toned |
| Mixing font families in one element | Noto Serif for content, Space Grotesk for interface |
| Rounded, friendly corner radii (> 5 px) | Precise, restrained rounding (2–5 px) |
| Spring / bounce animations | 300 ms ease-out fade+slide |
| Playful or illustrative empty states | Structural icons + terse copy in the app's voice |
| Extra red hues for error | Error text in vermilion accent only |
| Hardcoded `left`/`right` in layout | Flex `start`/`end`, RTL-safe props |
| Status colors (`#3B82F6`, `#F97316`, `#22C55E`) outside book-status badges | Reserve them strictly for reading status |
| Full-screen loading spinners | Inline skeletons or localized spinners |
