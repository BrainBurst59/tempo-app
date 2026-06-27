# TEMPO Game Engine / Quest Engine Architecture

Status: Foundation (contracts + deterministic rules + seams). Not yet wired to backend, persistence, or UI.
Owner: TEMPO product engineering
Related: `docs/adr/0002-game-engine.md`, `security/threat-models/0002-game-engine.md`, `@tempo/contracts` (`src/game/*`), `@tempo/rules-engine` (`src/game/*`)

## 0. Purpose and the one inviolable rule

The Game Engine is a first-class TEMPO launch pillar: the motivation, progression, and retention layer that turns real, verified fitness behavior into avatar growth, XP, quests, asynchronous competition, ghost rivals, and cosmetic unlocks. It is not a gimmick, a side feature, or an MVP-level gamification skin.

> **Fitness progress cannot be purchased. It must be earned.**

Strength, endurance, mobility, fuel, recovery, technique, rhythm, XP toward verified progress, levels, and competitive standing are produced only by real, verified activity. Money may buy cosmetics. Money may never buy progress or competitive advantage. This rule is enforced in three places so it cannot quietly erode:

1. **Contracts** — cosmetic reward items are typed as cosmetic-only and non-performance-affecting; purchase paths cannot reference stat/XP/competitive effects.
2. **Rules** — competitive XP and reward eligibility are computed deterministically from verified activity and safety context, never from entitlements.
3. **Docs and review** — this document, the ADR, and the threat model make the boundary explicit and auditable.

## 1. System position

```text
            Wearables ── HR / sessions / motion / route signals
                 │
 Training ──┐    ▼
 Fuel ──────┤  Verification ──► XP Economy ──► Avatar Progression ──► Progress
 Move ──────┤    │                  │                  │
 Today ─────┘    ▼                  ▼                  ▼
            Anti-cheat        Quests / Events     Cosmetic Unlocks
                                   │
                                   ▼
                     Competitions / Leaderboards / Ghost Rivals
                              (opt-in / privacy-preserving)
```

The Game Engine consumes signals from Training, Fuel, Move, Wearables, and Today; it never overrides their safety logic. The Today Engine remains the deterministic safety authority: if Today de-escalates (pain, under-fuel, poor recovery), the Game Engine must not create a counter-incentive to escalate.

## 2. Avatar progression

- Progression is expressed through seven game stats: `strength`, `endurance`, `mobility`, `fuel`, `recovery`, `technique`, `rhythm` (`GameStat`).
- `AvatarProgressionState` holds the archetype and evolution stage (reused from the existing Avatar contracts — not duplicated), an overall level, total XP, and a per-stat level/XP value.
- Evolution stages (`base → consistent → charged → peak_rhythm`) reflect rhythm, consistency, recovery, and capability — never body shape, weight, or appearance-as-punishment.
- Progression is **monotonic with respect to earned XP**: missed days, injury, disability, recovery, and under-fueling never reduce a level. Inactivity simply does not add XP; it never subtracts it. There is no decay penalty that punishes rest.

## 3. XP economy

- XP is split into two non-fungible kinds:
  - **Personal XP** — the user's own progress and avatar growth. Earnable from any honest activity, including manual entry and recovery.
  - **Competitive XP** — counts toward competitions, leaderboards, and ghost-rival standing. Gated by verification and safety.
- XP is awarded against a target: a specific `GameStat` or `overall`.
- Every award is recorded as an append-only `XpLedgerEntry` (auditable, attributable, reversible only by compensating entries — never silent mutation). Economy-level audit events are `GameEconomyEvent`s.
- Award magnitude is a deterministic function of effort, duration, activity type, verification level, daily diminishing returns, and safety context. See `@tempo/rules-engine/src/game/xp.ts`.

## 4. Quest engine

- `Quest` defines a category (`daily`, `weekly`, `milestone`, `event`, `seasonal`), an objective type and target, an optional target stat, an optional minimum verification level for competitive credit, and a `QuestReward`.
- `QuestProgress` tracks a user's current/target counts and completion.
- A `QuestReward` may grant XP (earned through the activity the quest required) and/or a single cosmetic catalog item. Quests never grant raw stat boosts or competitive advantage outside earned XP.
- Quests that carry competitive reward require the contributing workouts to meet the quest's verification floor; otherwise the quest can still complete for personal progress but withholds competitive credit.

## 5. Verification confidence score

- Every workout is classified into a `WorkoutVerificationLevel`: `unverified`, `standard`, `high_confidence`, or `suspicious`.
- `VerificationConfidenceScore` carries a 0–100 score, the level, the corroborating signals used, and reason codes.
- Classification (`classifyWorkoutVerification`) is deterministic:
  - **suspicious** — impossible pace, duplicate submission, or claimed duration grossly inconsistent with the foreground/sensor evidence. Earns no competitive XP.
  - **unverified** — manual-only entry with no corroborating signal. Earns personal progress; competitive XP is capped low.
  - **standard** — at least one corroborating signal.
  - **high_confidence** — multiple corroborating signals (e.g. wearable HR + workout session, or session + GPS route) and a high score.
- Corroborating signals (`VerificationSignal`): wearable heart rate, wearable workout session, motion sensor, GPS route, location dwell, app-foreground session. Where a signal is unavailable on the user's hardware, the engine does not penalize beyond the honest evidence level — it simply cannot reach `high_confidence` without corroboration.

## 6. Anti-cheat and abuse detection

- First line: the deterministic verification classifier (above) plus competitive-XP gating.
- Second line: rate/load plausibility — daily training-load protection caps repeated hard sessions; impossible-pace and duplicate detection mark workouts suspicious.
- Third line (server, future milestone): cross-device/session correlation, anomaly scoring, and manual review queues fed by `safety_review_flagged` economy events.
- AI is never the adjudicator of fairness. AI may summarize or explain; the deterministic rules decide competitive credit.

## 7. Leaderboards with privacy controls

- `LeaderboardEntry` exposes a rank, a pseudonymous display handle, a score, and an `isSelf` flag — never a raw user id or real name. Participation is keyed by an opaque reference.
- Leaderboards are **opt-in**. A user who has not opted in does not appear and is not ranked.
- Visibility tiers: `private`, `friends_opt_in`, `public_pseudonymous`. Default is `private`.
- Only competitive XP from verified activity contributes to leaderboard score, so the board cannot be bought or faked into.

## 8. Asynchronous competitions

- `Competition` models time-boxed asynchronous challenges (`asynchronous_challenge`, `ghost_rival`, `leaderboard_season`) over a metric stat, with an opt-in requirement and a default-private visibility.
- `CompetitionEntry` records an explicit opt-in, the chosen visibility, accumulated competitive XP, and the entry's verification level.
- Asynchronous design avoids real-time pressure, reduces unsafe "race now" escalation, and works with intermittent connectivity.

## 9. Ghost rivals

- `GhostRival` represents a pace line a user competes against: their own past performance (`self_past`), an explicitly opted-in friend (`opted_in_friend`), or a synthetic pacer (`synthetic_pacer`).
- Ghost rivals are **privacy-preserving by default**: a friend's pace is only usable with their explicit opt-in, and rivals carry a label, not identifying data. Synthetic pacers carry no personal data at all.
- Ghost rivals must not encourage unsafe escalation: pacing is informational and respects the same safety gates as XP.

## 10. Reward balancing

- Reward magnitudes are deterministic and bounded. Diminishing returns prevent grinding a single stat for unbounded daily XP.
- Cosmetic rarity/unlock cadence is tuned in the catalog, not by spend. A purchasable cosmetic and an earned cosmetic are functionally identical — both are visual-only.
- Competitive reward is always proportional to verified, safe effort, never to time-on-app alone.

## 11. Stamina / recovery model

- The engine reads recovery and fuel status (shared vocabulary with the Today Engine) and the day's prior hard-session count.
- "Stamina" is a safety governor, not a paywall: when recovery is poor, fuel is low, or the user has already done more than two hard strength sessions, additional hard work yields diminishing competitive returns and a safety flag rather than escalating rewards.
- Stamina can never be refilled with money to gain competitive advantage. Any future cosmetic "energy"/aura visuals are decorative only.
- Recovery activities always earn recovery XP. Rest and de-load are first-class, rewarded behaviors.

## 12. Cosmetics / unlocks

- `RewardCatalogItem` types: `skin`, `aura_effect`, `arena_theme`, `companion_animation`, `ring_unlock`, `avatar_accessory`.
- Every catalog item is typed `isCosmeticOnly: true` and `affectsPerformance: false`. The schema makes a performance-affecting purchasable item unrepresentable.
- Acquisition is `earned` or `purchasable`. Both yield identical visual-only effects. No item, by either path, grants stats, XP-as-progress, or competitive edge.

## 13. Event system

- Economy state changes emit append-only `GameEconomyEvent`s (`xp_awarded`, `level_up`, `stat_level_up`, `quest_completed`, `reward_granted`, `cosmetic_unlocked`, `diminishing_returns_applied`, `daily_load_protection_applied`, `safety_review_flagged`, `competitive_xp_withheld`).
- Events drive auditability, analytics (privacy-filtered), avatar reactions, and Today/Progress integration. They are the integration seam between the deterministic rules and the rest of TEMPO.

## 14. Game analytics

- Allowed: counts and aggregates over economy events (quests completed, levels reached, opt-in rates), with no sensitive payloads.
- Prohibited: raw health/HR/GPS/route/body data, food photos, or verification raw inputs in analytics. Verification operates on signal presence/derived scores, and only derived, non-sensitive metadata may be analyzed.
- No game signal is ever used for ads, ad targeting, profiling, or data sale.

## 15. Safety rules (summary)

- Never reward unsafe escalation. Under-fuel, poor recovery, pain flags, and over-load reduce competitive reward and raise safety flags.
- More than two hard strength sessions/day → diminishing returns or safety review unless strongly corroborated.
- Recovery always earns recovery XP.
- Avatar progression never punishes missed days, injury, disability, recovery, or under-fueling.
- No shame, no "no pain no gain," no streak mechanics that punish rest.

## 16. Privacy and compliance (summary)

- GPS, HealthKit, Health Connect, heart rate, body metrics, workout logs, food logs, and avatar-derived inferences are **Sensitive Personal Data** (CLAUDE.md §9).
- Game use of these signals requires clear purpose, consent, revocation, deletion, and no analytics leakage (CLAUDE.md §10, §17).
- Leaderboards and ghost rivals are opt-in or privacy-preserving by default.
- No chat, comments, or open user-generated content is introduced in this step.

## 17. What is intentionally NOT in this foundation

- No backend endpoints, persistence, or migrations (future Game Engine service milestone).
- No monetization wiring or RevenueCat integration.
- No user-facing game screens in the launch path.
- No AI generation of economy state.

These are deliberate seams: contracts and deterministic rules are in place so the service, persistence, and UI can be built against a stable, tested core without re-litigating the earn-not-buy, safety, and privacy boundaries.
