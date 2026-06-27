# ADR 0001: Mobile Stack and Monorepo Baseline

Status: Accepted

## Decision

TEMPO starts as a pnpm workspace monorepo with Expo React Native for iOS/Android, shared TypeScript contracts, shared design tokens, and a deterministic rules engine package.

## Rationale

TEMPO is a market-ready fitness super app, not a throwaway app. The monorepo allows mobile, backend, workers, shared contracts, rules, and design primitives to evolve together with one CI gate.

Expo is used for the iOS/Android mobile client because it provides React Native app infrastructure, file-based routing through Expo Router, EAS build/submit paths, and first-class monorepo support in current SDKs.

## Constraints

- Native Apple Watch work belongs in `apps/watch-ios` and should use SwiftUI/watchOS.
- HealthKit and Health Connect integrations must be isolated behind domain services.
- Paid AI, maps, and storage APIs must not be called directly from mobile clients unless explicitly approved through an ADR.
- Shared contracts must be versioned and validated.
