# Product

## Register

product

## Users

**Primary: Patients**
- Home users, self-paced analysis via mobile or desktop
- Seeking to understand their fluency patterns and track progress
- Context: Private, often vulnerable moment (recording themselves speaking)
- Goal: Quick analysis, clear insights, encouragement to practice

**Secondary: Speech Therapists**
- Managing multiple patients, tracking progress over time
- Context: Office or home, reviewing sessions between appointments
- Goal: Clinical data, treatment planning, asynchronous patient monitoring

## Product Purpose

FluentVoice is an AI-powered fluency analysis app that helps patients understand their speech patterns and therapists track clinical progress. It turns voice recordings into actionable insights: fluency scores, disfluency timelines, speech rate, and progress trends. Success is a patient feeling understood and a therapist having the data they need to guide treatment.

## Brand Personality

**Clinical but warm.** Evidence-based and trustworthy, never clinical-cold. Supportive and encouraging, never dismissive of struggle. **Minimal and clear.** No unnecessary features or jargon. Every metric earns its place. **Accessible by default.** Keyboard navigation, screen reader support, high contrast, readable type. Designed for patients in distress, not just data scientists.

Three words: **Precise, Human, Clear.**

## Anti-references

- **Healthcare clichés**: Blue/white + stethoscope iconography, "trust us" empty messaging, overcomplicated dashboards
- **SaaS minimalism gone cold**: Brutalist grids, aggressive whitespace, no warmth or encouragement
- **Overcomplicated clinical tools**: 20-column data tables, unexplained metrics, jargon gatekeeping
- **Patronizing accessibility**: "Simple mode" buttons, dumbed-down language, treating users as incapable
- **Modal hell**: Popup confirmation dialogs, interrupt-driven UX, breaking flow

## Design Principles

1. **Clinical accuracy first, then warmth.** Data is trustworthy. Delivery is human. Show real metrics without sterile presentation.
2. **Clarity over completeness.** One insight well-presented beats three buried in tabs. Strip ruthlessly.
3. **Encourage, never guilt.** Progress is visible. Setbacks are normalized. Language lifts, never blames.
4. **Accessibility is the design.** Not a checkbox. High contrast, keyboard-first, semantic HTML. Works for everyone as default, not retrofit.
5. **Respect the moment.** Patients recording are vulnerable. Fast. Clear. No surprises. Loading states, error messages, empty states all anticipate anxiety.

## Accessibility & Inclusion

- **WCAG 2.1 AA minimum.** Aim for AAA on critical paths (recording, results, session history).
- **Keyboard navigation**: All interactive elements accessible via Tab, Enter, Esc. No mouse-only workflows.
- **Screen reader support**: Semantic HTML, ARIA labels on metric cards, live regions for analysis progress.
- **Motion**: Reduce motion respected. Animations inform, never distract.
- **Color**: Never rely on color alone. Disfluency pills tagged with icons + color. Status indicators use symbol + hue.
- **Typography**: Minimum 16px body on mobile, 18px desktop. Line length capped at 70ch. High contrast: navy on light, white on navy.
- **Neurodivergence**: Clear loading states. No time pressure. Honest error messages. Avoid flashing > 3 per second.
