# TEMPO App Starter

TEMPO is an avatar-led AI fitness super app for iOS, Android, Apple Watch, and supporting backend/admin surfaces.

This starter repo is intentionally production-shaped from the first commit. It is not an MVP scaffold, prototype, demoware, or generic Expo template. It establishes the mobile shell, shared contracts, design tokens, deterministic Today Engine, security documentation, and CI gates that future Claude/Cursor/Codex work must preserve.

## What is included now

- `apps/mobile`: Expo React Native iOS/Android shell using Expo Router and TypeScript.
- `packages/contracts`: shared Zod schemas and typed TEMPO domain contracts.
- `packages/rules-engine`: deterministic Today Engine v1 with safety-aware recommendation logic and tests.
- `packages/ui`: Surreal Performance OS tokens and reusable mobile UI primitives.
- `docs`: architecture decisions and launch-scope notes.
- `security`: starter threat model for mobile shell and sensitive data posture.
- `.github/workflows/ci.yml`: production-oriented CI gate.
- `CLAUDE.md`, `AGENTS.md`, `PROJECT_INSTRUCTIONS.md`: coding-agent governance.

## Required local tools

- Node.js LTS
- pnpm
- Expo CLI through package scripts
- iOS Simulator through Xcode for iOS development
- Android Studio emulator for Android development

## First setup

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm lint
pnpm --filter @tempo/mobile start
```

Then press `i` for iOS simulator or `a` for Android emulator in the Expo CLI.

## Development rule

Every feature must be implemented as the market-ready product target, with work sequenced by engineering dependency rather than reduced to MVP scope. Read `PROJECT_INSTRUCTIONS.md`, `CLAUDE.md`, and `AGENTS.md` before adding code.

## Current production-shaped slice

The app currently renders the first operational shell:

- Today command center with avatar-led brand direction.
- Train, Fuel, Move, and Progress tabs.
- Deterministic Today recommendation derived from shared typed inputs.
- No fake auth, no fake persistence, no fake AI, no placeholder production promises.

This is the correct starting point for the launch product: it creates the real architecture, contracts, visual system, and rules-engine seam where the full super-app capabilities will plug in.
