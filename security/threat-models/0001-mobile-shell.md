# Threat Model 0001: Mobile Shell and Shared Contracts

## Scope

Initial Expo mobile shell, shared contracts, shared UI tokens, deterministic Today Engine, and repo-level CI.

## Sensitive data currently handled

No live sensitive user data is stored or transmitted in this initial shell. Sample data is static and non-user-owned.

## Future sensitive data categories

- Health and fitness signals
- Food logs and AI food-photo estimates
- GPS routes and location
- Camera captures, photos, and form-check media
- Body metrics and progress photos
- AI-derived inferences
- Subscription state

## Required controls before live data

- Auth provider integration
- Secure token storage
- Backend API with object-level authorization
- Privacy and permission management
- No sensitive analytics payloads
- Secure media upload flow using signed URLs
- Account deletion and data deletion paths
- App-store privacy labels and Data Safety mapping

## Initial controls included

- Strict TypeScript configuration
- Workspace separation for contracts/rules/UI
- Deterministic Today Engine with safety de-escalation tests
- CI quality gates
- Agent governance files at repo root
