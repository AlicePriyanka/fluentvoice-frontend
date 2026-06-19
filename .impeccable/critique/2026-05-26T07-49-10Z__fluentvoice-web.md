---
target: fluentvoice-web
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-05-26T07-49-10Z
slug: fluentvoice-web
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Recording feedback excellent; "sample data" banner clear; analyzing progress bar present |
| 2 | Match System / Real World | 3 | Severity interpretation card now explains scores in patient vocabulary |
| 3 | User Control and Freedom | 3 | Reset at every recording step; treatment checkboxes now persist |
| 4 | Consistency and Standards | 3 | Icon fix landed; still flat vs. gradient button inconsistency |
| 5 | Error Prevention | 3 | Min duration guard, silent recording check, file size check all in place |
| 6 | Recognition Rather Than Recall | 3 | Metric labels, disfluency pills, severity badges all present |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts; no jump to latest session; no bulk therapist actions |
| 8 | Aesthetic and Minimalist Design | 3 | Patient dashboard hierarchy fixed; therapist header still reads hero-metric |
| 9 | Error Recovery | 3 | All error states are warm, specific, with clear recovery paths |
| 10 | Help and Documentation | 1 | No onboarding; new patient sees mock data with no guidance |
| **Total** | | **27/40** | **Solid — core UX works, quality gaps remain** |

## Anti-Patterns Verdict
Detector: 1 finding — bg-black/30 (sessions drawer backdrop, line 156). LLM: therapist dashboard header still matches hero-metric template.

## Priority Issues
- [P1] No onboarding/empty state — new patients see mock data as their own
- [P1] Recording buttons (mic + stop) lack aria-label — core interaction inaccessible
- [P2] Therapist dashboard header is hero-metric template anti-pattern
- [P2] Sessions page drawer backdrop bg-black/30 (detector confirmed)
- [P3] Primary button gradient/flat inconsistency across pages

## Persona Red Flags
- Jordan (first-timer): Mistakes mock data for real data; never records
- Sam (anxious patient): Microphone denied error gives no resolution path
- Dr. Chen (therapist): Treatment plan "Save" is visual-only; data lost on refresh
