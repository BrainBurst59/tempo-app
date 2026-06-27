# Threat Model 0002: Game Engine / Quest Engine (Foundation)

## Scope

Shared game contracts (`@tempo/contracts/src/game/*`) and deterministic game rules (`@tempo/rules-engine/src/game/*`). No backend, persistence, monetization, or UI is in scope for this foundation. No live sensitive user data is stored or transmitted by this layer yet.

## Assets

- Integrity of the XP economy and competitive standing (must reflect real, verified, safe activity).
- User safety (no incentive to over-train, under-fuel, or train through pain).
- Sensitive personal data used as verification signals: heart rate, workout sessions, motion, GPS routes, location, body metrics, workout/food logs, avatar-derived inferences (CLAUDE.md §9).
- User trust in fairness and privacy.

## Threats and mitigations

| Threat                                               | Mitigation in this foundation                                                                                                                                                    | Future milestone                                                              |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Fabricated/manual workouts earn competitive standing | `classifyWorkoutVerification` marks manual-only as `unverified`; competitive XP is capped low for unverified and zero for `suspicious`. Personal progress still allowed.         | Server-side cross-session/device correlation, review queue.                   |
| Replay / duplicate submissions                       | Duplicate and impossible-pace inputs classify as `suspicious` → no competitive XP.                                                                                               | Idempotency keys + server dedup on the ledger.                                |
| XP grinding / over-training for reward               | Daily diminishing returns; daily training-load protection caps repeated hard strength sessions; safety flags instead of bonuses.                                                 | Server-enforced rate/load limits, anomaly scoring.                            |
| Pay-to-win                                           | Cosmetic catalog items typed `isCosmeticOnly: true` / `affectsPerformance: false`; reward/XP paths never reference purchase entitlements.                                        | Entitlement checks server-side; cosmetic-only invariant in store integration. |
| Rewarding unsafe escalation                          | Under-fuel/poor-recovery/pain/over-load reduce competitive reward + raise `safety_review_flagged`; recovery still earns recovery XP.                                             | Tie to Today Engine safety state server-side.                                 |
| Punishing rest/injury/disability                     | Progression is monotonic in earned XP; no decay; missed days subtract nothing.                                                                                                   | Same invariant enforced in persistence.                                       |
| Sensitive-signal leakage to analytics/ads            | Analytics restricted to derived, non-sensitive economy-event metadata; raw HR/GPS/route/body data and verification raw inputs are never analyzed or used for ads/profiling/sale. | PII scrubbing + Data Safety mapping at the service.                           |
| Identity exposure on leaderboards                    | `LeaderboardEntry` exposes pseudonymous handle + opaque ref only; opt-in required; default visibility `private`.                                                                 | Opaque participant references + opt-in enforced server-side.                  |
| Non-consensual social exposure (ghost rivals)        | Friend pace requires explicit opt-in; synthetic pacers carry no personal data; `privacyPreserving: true`.                                                                        | Consent checks server-side.                                                   |
| Open UGC abuse (harassment, etc.)                    | No chat/comments/open UGC introduced in this scope.                                                                                                                              | Deferred; requires moderation design before any UGC.                          |

## Sensitive data handling

- Verification consumes the **presence** and derived plausibility of signals, not raw streams, and produces derived scores. Raw sensitive inputs are not part of the persisted economy contracts.
- Consent, revocation, deletion, retention, and export for any future persisted game data must reuse the existing consent/privacy contracts (`@tempo/contracts` consent/privacy) and CLAUDE.md §9–§11, §17 controls before live data is stored.

## Required controls before live game data

- Backend object-level authorization on all game reads/writes (BOLA/IDOR tests).
- Append-only ledger with idempotency and compensating entries (no silent mutation).
- Server-side verification, load protection, and anti-cheat enforcement (clients are untrusted).
- Privacy-filtered analytics; no sensitive payloads.
- Consent + revocation + deletion + export wired to game data.
- Opt-in enforcement for leaderboards/competitions/ghost rivals.

## Controls included now

- Deterministic, unit-tested verification, XP, load-protection, progression, quest, and reward-eligibility rules.
- Type-level cosmetic-only / non-performance reward invariant.
- Pseudonymous, opt-in leaderboard and privacy-preserving ghost-rival contracts.
- No sensitive data persisted; no backend/monetization/UI surface.
