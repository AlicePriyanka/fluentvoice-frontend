---
target: full app
total_score: 21
p0_count: 1
p1_count: 3
timestamp: 2026-05-26T07-25-15Z
slug: fluentvoice-web
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Recording states excellent; localStorage hydration causes silent content flash |
| 2 | Match System / Real World | 3 | "Disfluency" never defined inline; "N/A" speech rate unexplained to patients |
| 3 | User Control and Freedom | 2 | Treatment checkboxes reset on refresh with no warning; sign-out clears nothing |
| 4 | Consistency and Standards | 2 | Same action has 3 names: "Record now" / "Record Voice" / "New recording" |
| 5 | Error Prevention | 2 | No warning that treatment progress doesn't persist; raw API errors reach patients |
| 6 | Recognition Rather Than Recall | 3 | Navigation and session cards clear; no "what does this score mean?" help |
| 7 | Flexibility and Efficiency | 1 | No keyboard shortcuts, no filtering, no batch actions |
| 8 | Aesthetic and Minimalist Design | 2 | Six equal-weight dashboard sections; identical card grids |
| 9 | Error Recovery | 2 | Mic-denied error doesn't link to browser settings; API errors exposed verbatim |
| 10 | Help and Documentation | 1 | Zero contextual help; fluency scores and disfluency types never explained |
| **Total** | | **21/40** | **Acceptable** |

## Priority Issues

[P0] No mobile breakpoints on core layouts — grid-cols-3, grid-cols-4, grid-cols-[auto_1fr], grid-cols-2 all lack responsive variants.

[P1] Six equal-weight dashboard sections, no visual hierarchy.

[P1] Results screen abandons the patient emotionally — raw scores with no interpretation, no comparison to prior sessions, generic encouragement.

[P1] Hardcoded names in page headers ("Arjun Kumar", "Dr. Meera Iyer") not reading from localStorage.

[P2] Three names for the same action: "Record now" / "Record Voice" / "New recording".

## Persona Red Flags

Jordan: no fluency score definition; severity label without scale context; no next-step guidance after results.
Sam: SVG gauge lacks ARIA label; metric cards lack aria-label; drawer focus trap not implemented.
Priya (project-specific): "Severe" in red without context; no trend delta on results; generic copy reads as criticism.

## Minor Observations

- bg-black/30 overlay detected (pure-black) — substitute bg-[#1B2B5E]/30
- "Good morning," always hardcoded regardless of time
- Em dash in "Latest Session — Disfluency Timeline" (banned)
- Two stat cards on therapist dashboard share TrendingUp icon
- Treatment plan checkboxes reset on refresh with no indication
