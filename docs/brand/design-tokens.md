# ByTheWey Design Tokens

## Purpose

This document defines the design tokens used across the ByTheWey app.
Tokens are semantic (meaning-based), not raw values.
They exist to ensure consistency, accessibility, and a calm, readable UI.

This file is the source of truth for future UI work.

---

## Colour tokens

### Brand

- **color-brand-primary**
  Used for navigation active states, primary actions, and key highlights.
  Represents "Wey Teal".

- **color-brand-accent**
  Used sparingly for secondary emphasis, chips, and highlights.
  Represents "River Mist".

### Surfaces

- **color-surface-base**
  Main application background (warm off-white).

- **color-surface-card**
  Cards, modals, sheets, and primary content containers.

- **color-surface-muted**
  Subtle sections, separators, and low-emphasis backgrounds.

### Text

- **color-text-primary**
  Default body and heading text.

- **color-text-secondary**
  Supporting text, summaries, and descriptions.

- **color-text-muted**
  Metadata, timestamps, helper text.

- **color-text-inverse**
  Text displayed on dark or brand-coloured backgrounds.

### Borders and focus

- **color-border-subtle**
  Light dividers and card outlines.

- **color-border-strong**
  Emphasised borders and active states.

- **color-focus-ring**
  Focus outlines for accessibility.

### Category colours

Category colours are background tints only.
They must never be used for body text.

- **color-category-coffee**
- **color-category-pub**
- **color-category-kids**
- **color-category-culture**
- **color-category-shopping**

---

## Radius tokens

- **radius-sm**
  Used for chips, tags, and small UI elements.

- **radius-md**
  Default radius for cards and list items.

- **radius-lg**
  Used for modals, sheets, and larger surfaces.

- **radius-xl**
  Reserved for hero containers and top-level sections only.

**Rule:**
The app should feel slightly soft and approachable, not overly pill-shaped.

---

## Spacing system

ByTheWey uses an 8px-based spacing system only.

**Tokens:**

- **space-xs**
- **space-sm**
- **space-md**
- **space-lg**
- **space-xl**

**Rules:**

- Avoid arbitrary spacing values.
- Use larger spacing to create calm, readable layouts.
- Prefer whitespace over borders where possible.

---

## Elevation

- **shadow-card**

**Rules:**

- One shadow style only.
- Shadows are subtle and functional.
- No stacked, dramatic, or decorative shadows.

---

## Typography roles

### Font roles

- **font-heading**
  Used for section headers and key titles.
  Editorial in feel, readable, and restrained.

- **font-body**
  Default UI and content text.

- **font-meta**
  Dates, tags, labels, and secondary information.

### Text size scale

- **text-xs**
- **text-sm**
- **text-base**
- **text-lg**
- **text-xl**
- **text-2xl**

**Rules:**

- Body text should never be smaller than text-sm.
- Headings must be paired with sufficient whitespace.
- Avoid dense text blocks.

---

## Token usage rules

- Tokens must be used semantically, not aesthetically.
- Category colours guide scanning, not decoration.
- Colour should support hierarchy, not compete with content.
- UI should feel calm, legible, and consistent across all tabs.
- When in doubt, choose the quieter option.
