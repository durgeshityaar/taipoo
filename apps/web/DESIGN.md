---
version: 1
name: Taipoo
description: The design system for the Taipoo app — a warm, paper-calm workspace on an off-white canvas, near-black Inter type and a single confident blue for every action, with a small playful sticker palette reserved for decoration.

colors:
  primary: "#0075de"
  primary-hover: "#0068c7"
  primary-pressed: "#005bab"
  on-primary: "#ffffff"
  canvas: "#f6f5f4"
  surface: "#ffffff"
  ink: "rgb(0 0 0 / 0.95)"
  ink-secondary: "#31302e"
  ink-muted: "#615d59"
  ink-faint: "#a39e98"
  hairline: "#e6e6e6"
  hairline-strong: "#dddddd"
  destructive: "#c4302b"
  success: "#0f7b2c"
  hover-overlay: "rgb(55 53 47 / 0.08)"
  focus-ring: "rgb(0 117 222 / 0.35)"
  sticker-sky: "#62aef0"
  sticker-purple: "#d6b6f6"
  sticker-purple-deep: "#391c57"
  sticker-pink: "#ff64c8"
  sticker-orange: "#dd5b00"
  sticker-orange-deep: "#793400"
  sticker-teal: "#2a9d99"
  sticker-green: "#1aae39"
  sticker-brown: "#523410"

typography:
  heading-1: { fontFamily: Inter Variable, fontSize: 40px, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1px }
  heading-2: { fontFamily: Inter Variable, fontSize: 26px, fontWeight: 700, lineHeight: 1.23, letterSpacing: -0.625px }
  heading-3: { fontFamily: Inter Variable, fontSize: 22px, fontWeight: 700, lineHeight: 1.27, letterSpacing: -0.25px }
  title: { fontFamily: Inter Variable, fontSize: 20px, fontWeight: 600, lineHeight: 1.4, letterSpacing: -0.125px }
  title-sm: { fontFamily: Inter Variable, fontSize: 16px, fontWeight: 600, lineHeight: 1.5, letterSpacing: -0.01em }
  body-md: { fontFamily: Inter Variable, fontSize: 16px, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 }
  body-sm: { fontFamily: Inter Variable, fontSize: 15px, fontWeight: 400, lineHeight: 1.33, letterSpacing: 0 }
  caption: { fontFamily: Inter Variable, fontSize: 14px, fontWeight: 400, lineHeight: 1.43, letterSpacing: 0 }
  nav: { fontFamily: Inter Variable, fontSize: 13px, fontWeight: 400, lineHeight: 1.38, letterSpacing: 0 }
  eyebrow: { fontFamily: Inter Variable, fontSize: 12px, fontWeight: 600, lineHeight: 1.33, letterSpacing: 0.125px }
  button: { fontFamily: Inter Variable, fontSize: 14px, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0 }

rounded:
  xs: 4px
  sm: 5px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px

spacing:
  base: 4px
  scale: [4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64]

elevation:
  flat: "none (hairline only)"
  soft: "rgb(0 0 0 / 0.01) 0 0.175px 1.041px, rgb(0 0 0 / 0.02) 0 0.8px 2.925px, rgb(0 0 0 / 0.027) 0 2.025px 7.847px, rgb(0 0 0 / 0.04) 0 4px 18px"
  elevated: "rgb(0 0 0 / 0.01) 0 1px 3px, rgb(0 0 0 / 0.02) 0 3px 7px, rgb(0 0 0 / 0.02) 0 7px 15px, rgb(0 0 0 / 0.04) 0 14px 28px, rgb(0 0 0 / 0.05) 0 23px 52px"

components:
  button:
    backgroundColor: "{colors.primary}"
    hover: "{colors.primary-hover}"
    pressed: "{colors.primary-pressed} + scale(0.97)"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 36px
  button-outline:
    backgroundColor: "{colors.surface}"
    border: "1px {colors.hairline-strong}"
    hover: "{colors.hover-overlay} layered on the fill"
    rounded: "{rounded.md}"
  button-pill:
    description: "Hero actions only: empty-state CTAs, the public form's Submit."
    rounded: "{rounded.full}"
  input:
    backgroundColor: "{colors.surface}"
    border: "1px {colors.hairline-strong}"
    textColor: "{colors.ink}"
    placeholder: "{colors.ink-faint}"
    typography: "15px desktop / 16px mobile"
    rounded: "{rounded.xs}"
    height: 36px
    focus: "{colors.primary} border + {colors.focus-ring} ring"
  card:
    backgroundColor: "{colors.surface}"
    border: "1px {colors.hairline}"
    rounded: "{rounded.lg}"
    padding: 24px
    elevation: "{elevation.flat}; clickable cards: {elevation.soft} on hover"
  badge:
    typography: "{typography.eyebrow}"
    rounded: "{rounded.full}"
    padding: 2px 8px
    variants: "secondary (draft/neutral), info (primary tint), success, destructive"
  sidebar:
    backgroundColor: "{colors.canvas}"
    border: "1px {colors.hairline}"
    rowHover: "none on nav rows (only the active row changes); {colors.hover-overlay} on the header switcher and footer user menu"
    rowAction: "hidden until its own row is hovered or focused (e.g. + on a workspace, ⋯ on a form)"
    formMenu: "a form row's ⋯ opens a menu-panel to the right: Edit, Rename (inline input in the row), Copy link to share (disabled until live), Duplicate, then a separator and Delete (destructive, confirmed with AlertDialog); toasts are messages only"
    rowText: "{colors.ink-muted}"
    rowActive: "{colors.ink}, medium weight, no fill"
    rowRounded: "{rounded.md}"
    rowTypography: "{typography.nav}; header switcher and footer user menu: {typography.caption}"
    rowHeight: 28px
    labelTypography: "{typography.eyebrow}, {colors.ink-muted}"
  menu-panel:
    description: "dropdown menus, select lists, popovers"
    backgroundColor: "{colors.surface}"
    border: "1px {colors.hairline}"
    rounded: "{rounded.lg}"
    elevation: "{elevation.elevated}"
    itemRounded: "{rounded.sm}"
  dialog:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    elevation: "{elevation.elevated}"
  toast:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
  table:
    headerBackground: "{colors.canvas}"
    headerTypography: "{typography.eyebrow}"
    bodyTypography: "{typography.body-sm}"
    cellPadding: 12px 16px
    rowBorder: "{colors.hairline}"
    rowHover: "{colors.hover-overlay}"
  editor-block:
    description: "a question in the form editor: borderless, on the canvas, like a line in a document"
    gutter: "trash · + · ⠿ as 24px ghost icon buttons (16px icons) hanging in the left margin, centred on the title line, {colors.ink-muted}, shown on hover only (always on touch screens); narrow layouts pad the column so the gutter fits. + opens the question-type menu in place, ⠿ drags to reorder and opens the block menu"
    titleTypography: "{typography.title}, sized to its text, placeholder \"Type a question\" in {colors.ink-faint}; the answer box starts on the same left edge"
    requiredChip: "18px round {colors.hover-overlay} chip with an asterisk right after the title, only on required questions; clicking it makes the question optional"
    blockMenu: "menu-panel popover: type icon + title header, switch rows (Required, type settings), then action rows with shortcut hints in {typography.caption} {colors.ink-muted}"
    answerPreview: "an empty input (surface, {colors.hairline-strong} border, {rounded.md}, 36px, 14px side padding) with the type icon on the right in {colors.ink-muted}; multiple-choice options are the same box as a chip sized to its text, led by a 20px letter badge (A, B…; {colors.ink-muted} fill, white eyebrow text), then a fainter hairline \"Add option\" chip with the next letter"
    issue: "{typography.caption}, {colors.destructive}, directly under the field"
    submitPreview: "button-pill \"Submit →\" after the last block, inert"
    gap: 32px between blocks
  public-form:
    description: "/f/<slug>: one page on the canvas, max-w-2xl; looks like the editor so what you build is what respondents see"
    title: "{typography.heading-1}, description in {typography.body-md} {colors.ink-muted}"
    question: "title in {typography.title} with a {colors.ink-muted} asterisk when required; error in {typography.caption} {colors.destructive} under the field"
    fields: "44px tall, surface, {colors.hairline-strong} border, {rounded.md}, soft shadow (the editor's answer box); long answers grow from 112px"
    choices: "the editor's lettered option chips; selected = {colors.primary} border and ring, letter badge filled {colors.primary}"
    submit: "button-pill with an arrow; thank-you screen: message in {typography.heading-2}, centred"
    badge: "\"Made with Taipoo\" + logo, fixed bottom-right: surface, {colors.hairline} border, {rounded.md}, {typography.caption} semibold {colors.primary}"
    preview: "the editor's Preview renders the same view full screen over the editor, with an outline \"Back to editor\" button (Esc also closes); submitting validates but saves nothing"
  home:
    description: "/dashboard: Notion-style home. Greeting in {typography.heading-2}, then \"Your forms · n\" ({typography.eyebrow}, {colors.ink-muted}) over a surface list card ({rounded.lg}, {colors.hairline} border)"
    rows: "file icon + name (medium) · status (Live = {colors.success} dot + text, Draft = {colors.ink-muted}) · responses (links to Results) · edited (relative time, exact time on hover) · ⋯ on hover"
    empty: "empty-state card: logo, \"No forms yet\", one line of copy, pill New form; the header always has a primary + New form"
  results-table:
    description: "/forms/<id>/results: a Notion-style database of responses; title, count and table share one left edge"
    header: "{colors.canvas} band, each column = question-type icon + title in {typography.caption} {colors.ink-muted}; first column \"Submitted\" with a calendar icon"
    cells: "{typography.body-sm}, one line, truncated, 192–320px wide, {colors.hairline} borders, {colors.hover-overlay} row hover; the table scrolls sideways inside the page"
    sidePeek: "clicking a row opens a right Sheet with the whole response: type icon + title in {typography.caption} {colors.ink-muted}, answer in {typography.body-md} with line breaks kept, — when unanswered"
    actions: "header: Copy link, Download CSV (quiet), Edit (primary); Load more as an outline button under the table"
  empty-state:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xl}"
    padding: 32px
    action: "button-pill"
---

## Overview

Taipoo should feel like a well-organized desk in good daylight: calm, document-like, never clinical. Pages sit on a warm off-white **canvas** (`{colors.canvas}`); content lives on white **surfaces** (cards, fields, menus) that lift off it through hairlines rather than heavy shadows. Type is Inter in near-black `{colors.ink}`, with heavy, tightly-tracked headings and a calm 400-weight body.

Colour is used for exactly one structural job: **action**. The single blue `{colors.primary}` marks buttons, links, focus and "live" status — nothing decorative. Personality comes from a small **sticker palette** (sky, purple, pink, orange, teal, green, brown) used only for decoration: question-type icons, form cover colours, category dots.

**Key characteristics**
- Warm `{colors.canvas}` page and sidebar; white surfaces for everything you read or type into.
- One structural accent — `{colors.primary}` — for actions, links and focus.
- Red and green only for status (errors, destructive actions, success).
- Hairlines first, barely-there layered shadows second, never a hard drop shadow.
- 8px utility buttons for the app; pill buttons only for hero moments.
- Light theme only (for now).

## Colors

### Action
- **Primary** (`{colors.primary}`): primary buttons, inline links, focus rings, the "info" badge. White text on it passes AA (4.6:1).
- **Primary hover** (`{colors.primary-hover}`) and **pressed** (`{colors.primary-pressed}`): the two interactive states of primary buttons.

### Surfaces
- **Canvas** (`{colors.canvas}`): page background and sidebar.
- **Surface** (`{colors.surface}`): cards, inputs, menus, dialogs, toasts.
- **Hairline** (`{colors.hairline}`): card borders and dividers. **Hairline strong** (`{colors.hairline-strong}`): input and outline-button borders.

### Text
| Token | Contrast on white / canvas | Use |
|---|---|---|
| `{colors.ink}` | 21 / 19.3 | headings and body |
| `{colors.ink-secondary}` | 13.2 / 12.1 | secondary body copy |
| `{colors.ink-muted}` | 6.5 / 6.0 | helper text, descriptions, metadata ("Updated 2h ago") |
| `{colors.ink-faint}` | 2.7 / 2.4 | **placeholders and disabled text only** — every field has a visible label, so the placeholder is never the only information |

### Status
- **Destructive** (`{colors.destructive}`): validation errors, failed saves, delete actions. 5.5:1 on white, 5.1:1 on canvas.
- **Success** (`{colors.success}`): "Published", "Response submitted". 5.4:1 on white, 5.0:1 on canvas.

### Sticker palette (decoration only)
`{colors.sticker-sky}`, `{colors.sticker-purple}` / `{colors.sticker-purple-deep}`, `{colors.sticker-pink}`, `{colors.sticker-orange}` / `{colors.sticker-orange-deep}`, `{colors.sticker-teal}`, `{colors.sticker-green}`, `{colors.sticker-brown}`. Most fail contrast as text — never use them for text, CTAs, status or structural fills.

## Typography

**Family:** `Inter Variable`, fallback `-apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif`. Monospace: the system monospace (`ui-monospace, SF Mono, Menlo, Consolas`). Lining numerals (`lnum`) are enabled globally.

| Role (Tailwind class) | Size / weight / line-height / tracking | Use |
|---|---|---|
| `text-heading-1` | 40 / 700 / 1.1 / −1px | form title (editor and public form) |
| `text-heading-2` | 26 / 700 / 1.23 / −0.625px | page titles ("Your forms"); the public form's thank-you message |
| `text-heading-3` | 22 / 700 / 1.27 / −0.25px | reserved |
| `text-title` | 20 / 600 / 1.4 / −0.125px | section titles, auth card titles |
| `text-title-sm` | 16 / 600 / 1.5 / −0.01em | card titles |
| `text-body-md` | 16 / 400 / 1.5 | default body copy |
| `text-body-sm` | 15 / 400 / 1.33 | dense body, table cells |
| `text-caption` | 14 / 400 / 1.43 | captions, metadata (with `text-muted-foreground`) |
| `text-nav` | 13 / 400 / 1.38 | sidebar nav rows |
| `text-eyebrow` | 12 / 600 / 1.33 / +0.125px | badges, table headers, small labels |

Buttons and form labels use 14px / 500. Inputs use 15px on desktop and **16px on mobile** — iOS zooms into any field with smaller text.

**Principles:** weight is the main expressive lever — 700 for page titles, 600 for section and card titles, 400 for everything you read. Don't use heavy weights for body copy.

## Layout

### Spacing
4px base unit; use only the scale `4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64`. Tailwind's default spacing already matches (`gap-1` = 4px, `p-6` = 24px, `p-7` = 28px …), so no custom spacing tokens exist.
- 4–8px: icon/text gaps, compact padding.
- 12–16px: input and table-cell padding, gaps between related elements.
- 24px: card padding, gaps between cards.
- 32–64px: gaps between page sections.

### App shell
A sidebar that collapses to icons (`collapsible="icon"`, ⌘B, or the rail) with a workspace switcher in the header, the nav menu, and a user menu in the footer. The top bar (56px, 48px when collapsed; on the canvas, with a hairline bottom edge only below md where the sidebar becomes a sheet) holds the trigger and a breadcrumb, with page actions on the right as quiet caption text plus at most one compact primary button (the editor: an info "Changes" badge when the live form is behind the draft, status, Open form ↗, Preview, Publish); content fills the remaining width with 16px padding. Pages that read better narrow (forms, settings) constrain themselves with `max-w-*`.

### Responsive
| Breakpoint | Behaviour |
|---|---|
| < 640px | single column; sidebar becomes a slide-in sheet; inputs at 16px |
| 640–1024px | 2-up card grids |
| ≥ 1024px | sidebar docked, 3-up card grids |

Touch targets: at least 36px tall in the app (buttons and inputs are 36px), 44px on the public form; 8px between adjacent targets.

## Elevation

| Level | Class | Use |
|---|---|---|
| Flat | (hairline only) | default cards, panels, inputs |
| Soft | `shadow-soft` | clickable cards on hover, floating buttons |
| Elevated | `shadow-elevated` | dropdowns, select lists, popovers, dialogs |

Shadows are built from several near-transparent layers so surfaces feel gently lifted, never dropped. Most things rely on a hairline alone.

## Shapes

| Class | Value | Use |
|---|---|---|
| `rounded-xs` | 4px | inputs, textareas, selects, checkboxes, small tags |
| `rounded-sm` | 5px | menu items, list rows |
| `rounded-md` | 8px | buttons, sidebar rows |
| `rounded-lg` | 12px | cards, menus, popovers, toasts |
| `rounded-xl` | 16px | dialogs, empty states, large containers |
| `rounded-full` | 9999px | pill buttons, badges, avatars, radio buttons |

No sharp-cornered containers.

## Interaction

- **Hover (neutral):** `{colors.hover-overlay}` layered over the element's own background with the `bg-hover` utility — works on white, canvas and transparent elements alike. shadcn's `hover:bg-accent` uses the same tint for transparent items (menu rows, ghost buttons).
- **Hover (primary):** `{colors.primary-hover}`.
- **Hover (clickable card):** `shadow-soft` — mark the card with `data-interactive`. Static cards never move or lift.
- **Links:** `{colors.primary}`, no underline until hover.
- **Pressed:** `scale(0.97)` plus the pressed colour; no movement under `prefers-reduced-motion`.
- **Focus:** `{colors.primary}` border and a `{colors.focus-ring}` ring on every interactive element.
- **Disabled:** 50% opacity, `{colors.ink-faint}` text, no pointer events.

## Components

Built on shadcn-svelte (`src/lib/components/ui`). Use these; don't hand-roll equivalents.

| Need | Component / usage |
|---|---|
| Primary action | `<Button>` — one per view |
| Secondary action | `<Button variant="outline">` (white, hairline) or `variant="ghost"` (toolbars) |
| Destructive action | `<Button variant="destructive">`, confirmed with `AlertDialog` |
| Hero action | `<Button shape="pill" size="lg">` — empty states and the public form only |
| Text field | `Input`, `Textarea`, always with a `Label` (or `Field` for label + description + error) |
| Choice | `Select`, `RadioGroup`, `Checkbox`, `Switch` (on/off settings like "Required") |
| Container | `Card`; add `data-interactive` when the whole card is clickable |
| Status | `Badge` — `secondary` = draft/neutral, `info` = live/published, `success`, `destructive` |
| Menus | `DropdownMenu` (row actions like "…"), `Popover` (pickers) |
| Feedback | `toast()` from `svelte-sonner` (mounted once in the root layout) |
| Data | `Table` — eyebrow header on canvas, 12/16px cells, hover overlay |
| Sections | `Tabs` (e.g. Questions / Settings / Share) |
| Empty state | `Card` on canvas, `rounded-xl`, 32px padding, one pill action |

## Implementation

The system lives in three layers; the values above are implemented in code, and **code is the source of truth** — change a value there first, then update this file.

1. **`src/routes/tokens.css`** — the raw palette and shadows (`--blue`, `--paper`, `--ink-muted` …). Nothing in markup references these.
2. **`src/routes/layout.css`** — semantic roles shadcn understands (`--primary`, `--background`, `--border`, `--destructive`, `--success`, `--faint` …) mapped onto the palette, plus the Tailwind theme: type roles, radii, shadows and the `bg-hover` utility. A new type role must also be added to `typeRoles` in `src/lib/utils.ts`, or `cn()` / `tv()` treat it as a colour and drop it when merged with one.
3. **Components** — reference only roles and classes (`bg-primary`, `text-muted-foreground`, `rounded-lg`, `text-title-sm`).

**Customized shadcn components** start with a `design:` comment describing the change. `shadcn-svelte add … --overwrite` replaces them with the registry version, so after any overwrite, find and reapply them:

```sh
grep -rl 'design:' src/lib/components/ui
```

## Do's and Don'ts

### Do
- Use role classes (`bg-primary`, `text-destructive`, `border-border`) and type roles (`text-heading-2`, `text-caption`) — never raw hex values in markup.
- Keep pages on the canvas; put content on white surfaces.
- Reserve `{colors.primary}` for actions, links, focus and "live" status.
- Give every field a visible label; show validation errors in `{colors.destructive}` under the field.
- Use `bg-hover` for neutral hover states so they work on any background.
- Confirm destructive actions with `AlertDialog`.

### Don't
- Don't paint text, CTAs, status or structural fills with sticker colours.
- Don't use `{colors.ink-faint}` for anything a user needs to read.
- Don't add a second accent colour or a second primary button to a view.
- Don't use pill radius on inputs, or pill buttons for routine app actions.
- Don't use heavy drop shadows or make static cards lift on hover.
- Don't add spacing or radius values outside the scales above.
