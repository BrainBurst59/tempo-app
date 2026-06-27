# ADR 0002: Game Engine / Quest Engine as a Launch Pillar

Status: Accepted

## Decision

TEMPO adds a Game Engine / Quest Engine as a first-class launch product pillar. Its foundation is built as (1) shared, validated contracts in `@tempo/contracts` (`src/game/*`) and (2) deterministic, tested rule functions in `@tempo/rules-engine` (`src/game/*`). Backend services, persistence, monetization, and UI are deliberately deferred to later milestones and are out of scope for this foundation.

The economy is governed by one inviolable rule: **fitness progress cannot be purchased, it must be earned.**

## Rationale

Progression, quests, competition, and unlocks are core to TEMPO's motivation and retention promise and to the avatar-led brand. Built carelessly, gamification creates incentives to cheat (fake workouts), to over-train (XP grinding), and to monetize unfairly (pay-to-win). Building the foundation contracts-first and rules-first lets us encode the earn-not-buy, anti-cheat, safety, and privacy boundaries before any UI or monetization exists, so they cannot be quietly eroded later.

## Boundaries (durable)

- **Earn-not-buy.** Competitive XP, levels, stats, and standing derive only from verified, safe activity. Purchases unlock cosmetic/visual items only. The contracts make a performance-affecting purchasable item unrepresentable (`isCosmeticOnly: true`, `affectsPerformance: false`).
- **Deterministic fairness.** Verification classification, XP awards, diminishing returns, load protection, quest evaluation, progression, and reward eligibility are deterministic business logic in `rules-engine`. AI may explain or summarize but never adjudicates fairness or writes economy state.
- **Safety over reward.** Under-fuel, poor recovery, pain flags, and over-load reduce competitive reward and raise safety flags; they never produce bonuses. Avatar progression never punishes missed days, injury, disability, recovery, or under-fueling. The Today Engine remains the deterministic safety authority.
- **Privacy by default.** Sensitive fitness/health/location/wearable signals are used only for the user's own fitness experience. Leaderboards and ghost rivals are opt-in or privacy-preserving by default. No chat/comments/open UGC in this scope.

## Consequences

- A future Game Engine service builds against stable contracts and a tested rule core.
- Adding any reward path requires passing the cosmetic-only and safety/verification gates; weakening them is an explicit, reviewable change, not a silent default.
- Reused Avatar contracts (`AvatarArchetype`, `AvatarEvolutionStage`) avoid duplication; the game layer extends rather than forks the avatar model.

## Alternatives considered

- **AI-driven economy** — rejected: non-deterministic, unauditable, unsafe for fairness and safety decisions (conflicts with CLAUDE.md §12).
- **Ship gamification UI first, harden later** — rejected: would bake in pay-to-win/over-training incentives before the guardrails exist (conflicts with the no-MVP policy).
