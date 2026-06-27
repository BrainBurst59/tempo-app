# TEMPO

**Train with rhythm.**

TEMPO is an avatar-led fitness operating system for iOS, Android, Apple Watch, and supporting backend services. It connects training, nutrition, movement, recovery, wearables, progress tracking, and adaptive coaching into one daily command center.

The product is built around a simple question:

**What should I do today, and why?**

TEMPO answers that question by combining structured fitness data, user goals, workout history, nutrition patterns, recovery signals, movement activity, and avatar progression into a personalized daily plan.

## Product Direction

TEMPO is designed as a premium consumer fitness product with a distinct visual and behavioral identity.

Core principles:

- Training should feel adaptive, not chaotic.
- Progress should be earned through real consistency.
- Fitness data should become useful guidance, not dashboard noise.
- The avatar should grow with the user.
- Recovery, fuel, movement, and training should work together.
- AI should support clear coaching, not replace safety rules or deterministic logic.

TEMPO is not a generic workout logger, calorie tracker, wearable dashboard, or habit app. It is a connected performance system built around daily execution and long-term progression.

## Core Product Systems

### Today Engine

The Today Engine is the command center. It synthesizes training, fuel, recovery, movement, wearable signals, goals, soreness, and recent load to recommend the most appropriate action for the day.

### Training Engine

The Training Engine supports structured strength training, workout planning, set logging, exercise libraries, progression logic, smart swaps, pain/discomfort flows, and demo video architecture.

### Fuel Engine

The Fuel Engine manages food logging, nutrition targets, calories, macros, energy balance, barcode architecture, and AI-assisted food photo estimates with confidence ranges and correction flows.

### Move Engine

The Move Engine supports walking, running, cycling, hiking, GPS routes, activity summaries, weather-aware recommendations, and location-aware movement suggestions.

### Avatar Engine

The Avatar Engine gives users a living performance identity. Users select an avatar archetype, then evolve it through consistency, training, recovery, fuel, movement, and progress.

Avatar progression is designed to avoid body-shaming. Evolution reflects rhythm, energy, strength, confidence, recovery, capability, gear, aura, and milestone unlocks.

### Game Engine / Quest Engine

The Game Engine connects real user behavior to avatar growth, XP, quests, competitions, unlocks, and long-term engagement.

The core rule is:

**Fitness progress cannot be purchased. It must be earned.**

TEMPO may support cosmetic purchases, skins, aura effects, arena themes, challenge passes, and non-performance visual items. It does not sell strength, muscle, verified progress, leaderboard advantage, permanent stat boosts, or paid recovery overrides.

### AI Coach Engine

The AI Coach Engine provides explanations, progress recaps, food-photo interpretation, form cues, and safety-filtered coaching language. Deterministic rules drive safety-critical recommendations. AI supports the experience, but does not bypass validation, privacy controls, or safety boundaries.

### Wearables Engine

The Wearables Engine supports Apple Health, HealthKit, Apple Watch, Health Connect, workout data, activity data, heart rate, permissions, revocation, reconciliation, and privacy controls.

### Progress Engine

The Progress Engine tracks strength, activity, consistency, recovery patterns, nutrition trends, body timeline, avatar milestones, and long-term improvement.

## Engineering Standard

TEMPO is engineered as production software from the first commit.

The codebase uses a modular monorepo structure with separate surfaces for mobile, watch, backend, AI workers, shared contracts, deterministic rules, UI primitives, documentation, and security review.

Current structure:

```text
apps/
  mobile/        # Expo React Native iOS/Android app
  watch-ios/     # Native SwiftUI Apple Watch companion
  admin/         # Internal admin, support, and content tooling

services/
  api/           # Backend API
  ai-worker/     # AI and computer-vision worker services
  jobs/          # Scheduled sync, summaries, and notifications

packages/
  contracts/     # Shared schemas and domain contracts
  rules-engine/  # Deterministic product logic
  ui/            # Design tokens and reusable UI primitives
  config/        # Shared project configuration
  content-model/ # Exercise, avatar, food, and content schemas

docs/
  adr/           # Architecture decisions
  product/       # Product and launch documentation

security/
  threat-models/ # Threat models and security reviews
```

## Security and Privacy

TEMPO handles sensitive personal data, including fitness activity, food logs, health signals, body metrics, location, routes, photos, videos, wearable data, and AI-derived inferences.

The product is built around:

- Explicit consent
- Data minimization
- Purpose limitation
- Account deletion
- Data deletion
- Data export
- Secure storage
- Encryption in transit and at rest
- Authorization checks
- Privacy-preserving analytics
- No sensitive data in logs
- No sale of health, fitness, food, or location data
- No use of health data for advertising or unrelated profiling

## AI Safety

AI features in TEMPO are designed as controlled product systems.

AI may estimate, explain, summarize, classify, and assist. It must not diagnose, claim medical certainty, guarantee calorie accuracy, guarantee injury prevention, promote unsafe training, or encourage extreme dieting.

Food-photo estimates require confidence ranges and correction flows. Form feedback is framed as training cues, not medical analysis.

## Local Development

Install dependencies:

```bash
pnpm install
```

Run project checks:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
```

Start the mobile app:

```bash
pnpm --filter @tempo/mobile start
```

Then use the Expo CLI to launch iOS or Android:

```text
i = iOS simulator
a = Android emulator
```

## Development Workflow

All meaningful changes should be developed on a feature branch and reviewed through a pull request before merging to `main`.

Expected workflow:

```text
feature branch
pull request
CI checks
review
merge
```

Code changes must preserve the product architecture, security posture, privacy controls, type safety, tests, and release quality standards.

## Product Status

TEMPO is in active product development.

The current codebase establishes the production architecture, mobile foundation, shared contracts, deterministic rules, avatar-led design system, Game Engine foundation, security documentation, and CI gates required to build the full launch product.
