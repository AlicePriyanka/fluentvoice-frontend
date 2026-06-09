---
name: FluentVoice
description: Clinical fluency analysis app for patients and speech therapists
colors:
  navy: "#1B2B5E"
  navy-deep: "#0D1B3E"
  navy-light: "#2D44A0"
  navy-dim: "rgba(27, 43, 94, 0.08)"
  gold: "#C9A84C"
  gold-light: "#E8C96A"
  gold-dim: "rgba(201, 168, 76, 0.12)"
  bg: "#F0F4FF"
  surface: "#FFFFFF"
  surface-2: "#FAFBFF"
  border: "#DDE3F0"
  muted: "#E8EDF5"
  text: "#0F172A"
  text-2: "#374151"
  text-3: "#64748B"
  text-4: "#9CA3AF"
  green: "#10B981"
  amber: "#F59E0B"
  red: "#EF4444"
  indigo: "#6366F1"
  purple: "#8B5CF6"
  pink: "#EC4899"
  orange: "#F97316"
typography:
  display:
    fontFamily: "var(--font-display), system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.875rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "var(--font-display), system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "var(--font-body), system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "var(--font-body), system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-small:
    fontFamily: "var(--font-body), system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "var(--font-body), system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "0.05em"
    textTransform: "uppercase"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "20px"
  3xl: "24px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "40px"
  4xl: "48px"
shadows:
  sm: "0 2px 8px rgba(27, 43, 94, 0.05)"
  md: "0 4px 20px rgba(27, 43, 94, 0.08)"
  lg: "0 12px 40px rgba(27, 43, 94, 0.14)"
  xl: "0 24px 60px rgba(27, 43, 94, 0.22)"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.navy-light}"
  button-secondary:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.navy}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.border}"
  metric-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.2xl}"
    padding: "20px 16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
    height: "44px"
  input-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
---

## Overview

FluentVoice is a clinical fluency analysis tool designed for patients recording at home and therapists reviewing progress. The design system prioritizes clarity and warmth: **clinical precision** paired with **human encouragement**.

The palette is restrained: navy anchors trust and professionalism, gold accents highlight key actions and insights, and cool neutrals create calm white space. Typography is modern and accessible, defaulting to high contrast and readable sizing on all devices. Motion is purposeful—ease-out curves guide attention without distraction. Shadows are soft and consistent, creating subtle depth without visual weight.

**Color strategy**: Restrained. Navy + gold accent ≤10% of surfaces. Neutrals (light blues, grays) dominate. Semantic colors (green, amber, red, indigo, purple, pink) reserved for data visualization and status signaling.

**Theme**: Light mode (afternoon in a quiet office). Patient recording at home, therapist reviewing sessions. Natural daylight or calm indoor lighting. No night mode variant.

## Colors

**Primary**: Navy (#1B2B5E) represents clinical authority and trust. Use for primary CTAs, navigation, headers, focus rings.

**Accent**: Gold (#C9A84C) draws attention to key insights, fluency scores, and therapeutic moments. Applied sparingly—never as primary fill, typically as icons, borders, or highlight states.

**Neutrals**: 
- Background (F0F4FF): Soft, welcoming entry point. Slightly tinted toward navy for brand warmth.
- Surface (FFFFFF): Cards, modals, input fields. Pure white, no tint.
- Muted (E8EDF5): Disabled states, secondary surfaces, subtle dividers.
- Border (DDE3F0): Consistent line color. Provides structure without heaviness.
- Text hierarchy: Text (#0F172A) → Text-2 (#374151) → Text-3 (#64748B, muted) → Text-4 (#9CA3AF, disabled).

**Semantic**:
- Green (#10B981): Success, completion, improvement in fluency.
- Amber (#F59E0B): Warning, attention needed, pause or block detected.
- Red (#EF4444): Error, critical disfluency event or system failure.
- Indigo (#6366F1): Secondary metric (speech rate), analytical data.
- Purple (#8B5CF6): Prolongation event.
- Pink (#EC4899): Secondary data signal.
- Orange (#F97316): Accent for complementary insights.

Color should never be the only signal. Pair with icons, text, or badge styling.

## Typography

**Display** (clamp 1.875–3.5rem): Page headers, hero statements. Weight 700, tight line height (1.1). Negative letter spacing for impact.

**Headline** (clamp 1.5–2.25rem): Section titles, major results. Weight 700, slightly relaxed line height (1.2).

**Title** (1.125rem): Card headings, input labels. Weight 600, medium line height.

**Body** (1rem): Main content, descriptions, explanations. Weight 400, relaxed line height (1.6) for readability. Capped at 70 characters per line.

**Body Small** (0.875rem): Secondary text, captions, session metadata. Weight 400, line height 1.5.

**Label** (0.75rem): Form labels, badge text, metric names. Weight 600, uppercase, loose letter spacing (0.05em) for scannability.

Font stack: Inter or system fonts (system-ui, -apple-system, BlinkMacSystemFont, sans-serif) for performance and accessibility. No serif fonts in app UI.

Line length capped at 70ch for body text to prevent eye strain. On mobile, text scales down proportionally to maintain readability; never drop below 16px on phone inputs (prevent iOS zoom).

## Elevation

Shadows create subtle depth without visual hierarchy confusion. All shadows tint toward navy for brand consistency.

- **Shadow SM** (0 2px 8px rgba(27, 43, 94, 0.05)): Subtle lift on hover states, inactive badges.
- **Shadow MD** (0 4px 20px rgba(27, 43, 94, 0.08)): Default card shadow, standard component elevation.
- **Shadow LG** (0 12px 40px rgba(27, 43, 94, 0.14)): Floating modals, nav sidebars, prominent overlays.
- **Shadow XL** (0 24px 60px rgba(27, 43, 94, 0.22)): Hero cards, alert banners, top-level overlays.

No layered shadows (no mixing multiple shadows on one element). No glassmorphism or blur effects outside hero sections.

## Components

**Button: Primary**
- Background: Navy (#1B2B5E)
- Text: White
- Padding: 12px 24px (minimum 44px tall for touch target)
- Border radius: 16px
- Hover: Navy-light (#2D44A0)
- Focus: Navy + 3px navy outline (4px offset)
- Disabled: Muted background, Text-4 text, 50% opacity

Use for primary actions (Analyze, Save, Continue). Never use more than one per section.

**Button: Secondary**
- Background: Muted (#E8EDF5)
- Text: Navy (#1B2B5E)
- Padding: 12px 24px
- Border radius: 16px
- Hover: Border color (#DDE3F0)
- Disabled: 50% opacity

Use for alternative actions (Cancel, Skip, View Details).

**Metric Card**
- Background: Surface (white)
- Padding: 20px 16px
- Border: 1.5px solid Border (#DDE3F0)
- Border radius: 20px
- Shadow: MD
- Text hierarchy: large number (navy, weight 900) + label (text-4, uppercase)
- Icon: Leading emoji or colored icon, aria-hidden

Cards display one metric per card. Grid layout (1-4 columns responsive). No nested cards.

**Input**
- Background: Surface (white)
- Border: 1.5px solid Border (#DDE3F0)
- Padding: 12px 16px
- Height: 44px (minimum, for touch)
- Border radius: 12px
- Focus: Border color changes to Navy, 3px box-shadow with navy at 15% opacity
- Placeholder: Text-4 color (#9CA3AF)
- Font size: 16px (never smaller on mobile, prevents iOS auto-zoom)

All inputs full width on mobile, constrained to content width on desktop (max 600px for forms).

**Disfluency Pill**
- Inline badge with colored background + text
- Padding: 6px 12px
- Border radius: 20px
- Background: Color mix of semantic color (50% opacity) + white
- Text: Semantic color (full saturation)
- Icon: Leading icon (block, prolongation, pause, word-rep, sound-rep, interjection)
- Timestamp: secondary text, opacity 60%

Example: Block badge = red background (50% opacity) + red text + red block icon + @0:08 timestamp.

**Navigation: Top Floating Pill**
- Background: White with 92% opacity
- Backdrop filter: blur(20px)
- Border: 1px solid Border (#DDE3F0)
- Padding: 8px 16px per item, 2px gap between
- Border radius: 50px (fully rounded)
- Shadow: MD
- Fixed position: top 20px, center-aligned
- Brand lockup: Navy icon + navy text (display weight)
- CTA buttons: Primary button styling

Used only on hero/landing pages, not in app dashboards.

**Session List Item**
- Background: Surface
- Padding: 16px
- Border: 1px solid Border
- Border radius: 12px
- Hover: Background tint to Muted (#E8EDF5)
- Layout: Flex, gap 12px
  - Avatar (48px square, rounded 12px, navy gradient or initials)
  - Content (flex 1)
    - Name + date (Text, weight 600)
    - Score + severity (Text-3, smaller)
    - Selected state: blue left border (2px, inset)

## Do's and Don'ts

**DO**:
- Use navy for primary structure (headers, CTAs, navigation).
- Pair color with icons, text, or shapes—never rely on hue alone.
- Respect `prefers-reduced-motion`; disable animations for users.
- Test all text at 16px+ on mobile; never force zoom to read inputs.
- Use full-width on mobile, constrain to readable width (70ch) on desktop.
- Provide clear loading states ("Analyzing audio…") so users know what's happening.
- Show error messages inline, near the field that failed.
- Always include a skip/back option to prevent dead ends.

**DON'T**:
- Use side-stripe borders (border-left/right) for accent—use full borders or background tints instead.
- Gradient text (background-clip: text + gradient). Use solid color + weight/size contrast.
- Glassmorphism or blur decoratively. Reserve for rare, purposeful overlays (e.g., modals).
- Stack modals or nested dialogs. Use inline progressive disclosure instead.
- Animate layout properties (width, height, margin, padding). Animate only opacity, transform, color.
- Show spinners without context ("Loading…" is better than a bare spinner).
- Use low-contrast text on patterned backgrounds.
- Assume motion is safe; always test with `prefers-reduced-motion: reduce`.
