# TEMPO Project Instructions

Version: 1.0  
Project: TEMPO, avatar-led AI fitness super app  
Operating mode: Commercial launch product, not MVP

## 1. Product Standard

TEMPO is being built as a market-ready consumer fitness super app. Do not frame, scope, recommend, design, or implement TEMPO as an MVP, prototype, demo, proof of concept, starter app, or vibe-coded experiment.

The target product is a complete launch-quality app for iOS, Android, Apple Watch, and supporting admin/backend systems. The product must be built to compete on quality, trust, security, completeness, polish, and brand distinction with leading consumer fitness apps.

The product direction is final unless Lance changes it:

- TEMPO is a surreal, avatar-led, AI-powered fitness operating system.
- The brand direction is Surreal Performance OS.
- The core promise is: Train with rhythm, not chaos.
- The avatar is central to product identity, motivation, progression, and retention.
- The app connects training, food, recovery, movement, wearables, GPS, weather, form guidance, videos, and progress into one daily coaching system.

## 2. No-MVP Rule

Agents must not recommend "MVP" versions of TEMPO features. When a feature is discussed, define the market-ready version first.

Allowed:

- Sequencing work by dependency.
- Building internal milestones.
- Using feature flags.
- Shipping private alpha/TestFlight builds.
- Creating implementation phases for engineering management.
- Splitting large features across pull requests.
- Staging infrastructure before feature completion.

Not allowed:

- Recommending public launch with incomplete pillars.
- Replacing required features with fake/manual placeholders.
- Using demo-only integrations in production paths.
- Shipping buttons or screens for unavailable functionality.
- Calling a shallow version "good enough" because it is easier to build.
- Suggesting that required launch capabilities can be deferred without explicit founder approval.
- Building a generic clean fitness app instead of the avatar-led TEMPO product.

If an agent believes a feature is too large, risky, expensive, or dependency-heavy, it must say so clearly and then propose a production-grade implementation path. It must not silently downgrade the feature.

## 3. Feature Recommendation Format

Whenever a feature is recommended, explored, scoped, or implemented, agents must include:

1. Final market-ready user experience.
2. Required mobile/client components.
3. Required backend services and data model.
4. Required AI/rules-engine behavior, if applicable.
5. Required privacy, consent, safety, and app-store controls.
6. Required analytics and observability.
7. Required tests.
8. Launch-blocking acceptance criteria.
9. Risks and mitigations.
10. Implementation sequence, clearly labeled as engineering order, not MVP scope reduction.

## 4. Product Pillars

TEMPO consists of these launch product pillars:

### Today Engine

The command center. It answers: What should I do today, and why?

It must synthesize training history, food, calories, macros, energy balance, recovery, heart rate, sleep/readiness, soreness, schedule, weather, location, wearable data, goals, and avatar state.

### Training Engine

Strength training, workout planning, set logging, exercise library, smart swaps, RPE, progression, pain/discomfort flow, demo videos, and form-check entry points.

### Fuel Engine

Food logging, food search, barcode architecture, calorie/macro tracking, AI food photo estimates with confidence ranges, correction flow, nutrition targets, and energy balance.

### Move Engine

GPS tracking for running, walking, cycling, hiking, route summaries, map previews, weather-aware suggestions, location-aware activity recommendations, and activity summaries.

### Avatar Engine

Avatar archetype selection, avatar evolution, avatar state machine, gear/accessories, aura/ring unlocks, milestone states, and integration with training, food, recovery, movement, and progress.

### AI Coach Engine

Explanations, progress recaps, AI food-photo interpretation, conservative form cues, smart nudges, and safety-filtered coaching language. AI must support the product, not replace deterministic rules or safety controls.

### Wearables Engine

Apple Health, HealthKit, Apple Watch companion, Health Connect, health data sync, workout data, heart rate, activity, permissions, revocation, reconciliation, and privacy controls.

### Progress Engine

Strength progress, nutrition consistency, energy balance trends, body timeline, activity history, recovery patterns, avatar evolution milestones, and AI progress summaries.

### Game Engine / Quest Engine

The motivation, progression, and retention layer. It turns real, verified fitness behavior into avatar growth, an XP economy, quests, asynchronous competitions, ghost rivals, and cosmetic unlocks, and it connects to Avatar, Today, Training, Fuel, Move, Wearables, Progress, and AI Coach. This is a first-class launch pillar, not a gimmick, side feature, or MVP-level gamification layer.

It is governed by one inviolable product rule:

- **Fitness progress cannot be purchased. It must be earned.** Strength, endurance, mobility, fuel, recovery, technique, rhythm, XP toward verified progress, levels, and competitive standing come only from real, verified activity.

Monetization boundary:

- Paid purchases may unlock cosmetic and visual items only: cosmetics, skins, aura effects, arena themes, companion animations, and other non-performance visual items.
- Strictly prohibited pay-to-win mechanics: paid strength, paid muscle, paid verified progress, paid XP that counts as real progress, paid leaderboard advantage, permanent stat boosts, and paid recovery overrides.

Safety boundary:

- Game mechanics must never reward unsafe escalation. Under-fueled, poorly recovered, pain-flagged, or over-loaded states reduce competitive rewards and trigger safety handling, not bonuses.
- Avatar progression must never punish missed days, injury, disability, recovery, or under-fueling; recovery itself earns recovery progress.

Privacy boundary:

- Game features may use sensitive fitness, health, location, and wearable signals only to benefit the user's own fitness experience, never for ads, profiling, or manipulative monetization.
- Leaderboards and ghost rivals are opt-in or privacy-preserving by default. No chat, comments, or open user-generated content in the Game Engine's current scope.

Architecture and contracts are specified in `docs/product/game-engine-architecture.md`, `docs/adr/0002-game-engine.md`, the `@tempo/contracts` game contracts, and the deterministic `@tempo/rules-engine` game rules.

## 5. Brand and UX Standard

TEMPO must not look or feel like a generic fitness tracker.

The required brand direction:

- Surreal performance avatars.
- Cinematic athletic identity.
- Avatar-led progression.
- Glowing tempo rings.
- Hot coral, electric cyan, deep teal, tempo blue, pink/violet, amber, and premium dark/neutral structure.
- Premium, bold, polished, unusual, memorable.
- Serious fitness intelligence with a living performance identity.

Avoid:

- Beige wellness app.
- Plain MyFitnessPal clone.
- Strava clone.
- WHOOP clone.
- Fitbod clone.
- Apple Fitness clone.
- Dark neon gamer dashboard.
- Generic dumbbell branding.
- Cute-only mascot app.
- Bro-science language.
- Body-shaming transformation language.

The avatar system should be expressive and central, but safety, privacy, form feedback, permissions, subscriptions, food estimate uncertainty, and injury/pain flows must remain serious and trustworthy.

## 6. Engineering Standard

TEMPO must be engineered as production software from the first commit.

Required principles:

- Strong typing.
- Domain-driven modular architecture.
- Contract-first APIs.
- Real persistence.
- Explicit validation.
- Explicit permissions.
- Least-privilege data access.
- Secure defaults.
- Tested business logic.
- No secrets in code.
- No fake auth.
- No fake persistence.
- No production TODOs for security, privacy, subscriptions, or data deletion.
- No client-side API keys for paid AI, maps, storage, or backend services unless specifically intended for public client use and restricted appropriately.
- No direct mobile-to-AI calls that bypass backend safety, logging, rate limits, cost controls, and abuse prevention.

Preferred architecture:

```text
apps/
  mobile/        # Expo React Native iOS/Android app
  watch-ios/     # Native SwiftUI Apple Watch app
  admin/         # Internal admin/content/support tool
services/
  api/           # Backend API
  ai-worker/     # AI/computer-vision workers
  jobs/          # Scheduled sync, summaries, notifications
packages/
  contracts/     # API schemas and shared DTOs
  rules-engine/  # Today/training/fuel/recovery rules
  ui/            # Design tokens and reusable UI primitives
  config/        # Shared lint/test/env config
  content-model/ # Exercise/video/avatar/food schemas
infra/
  iac/           # Infrastructure as code
security/
  threat-models/
  reviews/
  policies/
docs/
  adr/
  product/
  api/
```

## 7. Security and Privacy Standard

TEMPO handles sensitive personal data: health, fitness, food, calories, macros, body metrics, photos, videos, location, GPS routes, wearable data, camera captures, AI-derived inferences, and subscription state.

All work must align with:

- NIST Secure Software Development Framework.
- OWASP Mobile Application Security Verification Standard.
- OWASP Mobile Application Security Testing Guide.
- OWASP API Security Top 10.
- OWASP Application Security Verification Standard.
- Apple App Store Review Guidelines.
- Google Play User Data policy.
- HealthKit, Apple Health, and Health Connect requirements.

Required controls:

- Explicit consent for sensitive data.
- Data minimization.
- Purpose limitation.
- Revocation path.
- Account deletion.
- Data deletion.
- Data export.
- Secure storage.
- Encryption in transit and at rest.
- Signed URLs for private media.
- No sensitive data in analytics.
- No health/location/photo/video data in logs.
- Audit logs for admin access.
- Strong authorization tests.
- Permission copy that clearly explains why data is requested.
- Privacy policy support from the beginning.

## 8. AI Safety Standard

AI features must be designed as controlled product systems.

Rules:

- Deterministic rules drive safety-critical recommendations.
- AI may explain, summarize, classify, estimate, and assist.
- AI must not make medical diagnoses.
- AI must not claim guaranteed calorie accuracy.
- AI must not claim guaranteed injury prevention.
- AI must not generate unsafe training, extreme dieting, or eating-disorder-promoting guidance.
- AI food estimates must include confidence ranges and correction flows.
- AI form feedback must be framed as training cues, not medical or clinical analysis.
- All AI prompts, model versions, safety filters, and output schemas must be versioned.
- High-risk AI outputs require test fixtures and evals before release.

## 9. App Store and Play Store Launch Standard

TEMPO must be built for successful review and long-term store compliance.

Before public submission:

- The app must be complete and stable.
- Backend services must be live for review.
- Reviewer/demo access must be available.
- In-app purchases/subscriptions must be complete, visible, restorable, and functional.
- Store screenshots and metadata must match actual functionality.
- Privacy disclosures must be accurate.
- Google Play Data Safety must be accurate.
- Account deletion must work.
- Permission prompts must be tied to real feature need.
- Health data must not be used for advertising, marketing, or unrelated data mining.
- Third-party content must be licensed or clearly authorized.
- AI, form, food, health, and location claims must be conservative and defensible.

## 10. Release Quality Gates

A feature is not launch-ready until it has:

- Production UX.
- Real data model.
- Real API contract.
- Real persistence.
- Auth/authorization coverage.
- Privacy and consent review.
- Safety copy where needed.
- Loading state.
- Empty state.
- Error state.
- Accessibility support.
- Unit tests.
- Integration tests.
- End-to-end or device tests for critical flows.
- Observability.
- App-store impact review.
- Documentation.
- Support behavior.

## 11. Agent Behavior

Agents must be opinionated, precise, and production-focused.

Agents should challenge weak implementation plans, but they must not challenge the stated product ambition by pushing MVP scope unless Lance explicitly asks for that conversation.

If scope, cost, or complexity is high, agents should say:

"This is a full product-grade feature. Here is the correct architecture and staged implementation path."

Agents should not say:

"For MVP, just do a simpler version."

When producing plans, prompts, code, or tickets, agents must preserve the TEMPO direction: fully loaded, avatar-led, surreal, premium, AI-powered, secure, privacy-aware, and market-ready.
