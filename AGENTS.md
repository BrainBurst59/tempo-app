# TEMPO Coding Agent Engineering Instructions

Version: 0.3  
Audience: Claude Code, Cursor, Codex, and any AI-assisted coding agent working in this repository  
Project: TEMPO, an avatar-led AI fitness super app for iOS, Android, Apple Watch, and web/admin surfaces
Operating mode: Commercial launch product. Not MVP. Not prototype. Not proof of concept. Not demoware.

## 1. Prime Directive

TEMPO is not an MVP, not a vibe-coded prototype, not a proof of concept, and not demoware. Treat this repository as production software for a commercial App Store and Google Play launch. The target is a market-ready, fully loaded fitness super app that can credibly compete in quality, trust, completeness, and polish with leading consumer fitness products.

Every code change must improve the end product while preserving security, privacy, reliability, accessibility, app-store compliance, and maintainability. If a request conflicts with these instructions, stop and explain the conflict before writing code. Never downgrade the requested product into an MVP, prototype, thin slice, simplified clone, fake implementation, or default generated app pattern unless Lance explicitly asks for a throwaway experiment outside the production code path.

Default behavior for all AI agents:

1. Understand the feature and its data sensitivity before coding.
2. Prefer small, reviewable changes over large rewrites.
3. Use explicit types, explicit validation, explicit permissions, and explicit tests.
4. Never invent APIs, dependencies, platform behavior, app-store rules, or security controls.
5. Never bypass, delete, or weaken tests, lint rules, type checks, auth checks, permission checks, privacy controls, or CI gates to make a task pass.
6. Never leave demo-only, placeholder, generated-template, or nonfunctional code in a production path.
7. Never handle health, location, food, body, photo, video, or wearable data casually.
8. Never claim medical, diagnostic, injury-prevention, calorie-accuracy, or form-accuracy certainty unless supported by documented validation and approved product/legal language.

The goal is best-in-class code, not default generated code.

## 2. Commercial Launch Product Policy

TEMPO is being built for a full market launch. Agents must not recommend, design, or implement MVP-level functionality when discussing the product roadmap, feature definitions, technical architecture, UX, security controls, or launch readiness.

Allowed: implementation sequencing, dependency ordering, behind-feature-flag development, internal alpha builds, TestFlight builds, staged pull requests, risk burn-down, and progressive hardening.

Not allowed: public launch with placeholder features, fake integrations, shallow versions of core functionality, manual-only flows pretending to be AI-powered flows, screenshots that imply unavailable features, disabled buttons for promised features, demo-only backends, incomplete privacy controls, incomplete subscription flows, or any "we can add that later" posture for capabilities that are part of the defined launch product.

When a feature is proposed or explored, agents must respond with the market-ready version of that feature. If the feature is large, split it into implementation milestones, but keep the acceptance criteria tied to the final launch-quality capability. Do not use the words MVP, prototype, proof of concept, quick demo, hacked together, or temporary implementation as a recommendation for production work. If those words appear in user-provided source material, reinterpret them as internal validation only and restate the production-grade target.

Feature recommendations must include:

1. The full launch-quality user experience.
2. Required backend/data model support.
3. Required mobile/native/platform support.
4. Required privacy, consent, safety, and app-store controls.
5. Required tests and observability.
6. Launch-blocking acceptance criteria.
7. Known risks and how to resolve them without cutting the feature down to MVP quality.

Market-ready means production-grade UX, real persistence, tested API contracts, secure auth/authorization, privacy controls, error states, loading states, empty states, accessibility, performance budget, observability, release notes, store review notes, and documented support behavior.

## 3. Product Context

TEMPO is a fully loaded AI fitness super app with these core engines:

- Today Engine: daily adaptive recommendation and explanation.
- Training Engine: workout plans, exercise library, set logging, smart swaps, videos, form-check entry.
- Fuel Engine: food search, barcode scanning, meal logging, AI food-photo estimates, macros, energy balance.
- Move Engine: GPS tracking, run/walk/cycle/hike summaries, weather-aware and location-aware activity suggestions.
- Avatar Engine: avatar selection, evolution, state, accessories, aura/ring unlocks, habit-based progression.
- AI Coach Engine: structured explanation, progress recap, safety-aware coaching text, food-photo interpretation, form cues.
- Wearables Engine: Apple Health/HealthKit, Apple Watch, Android Health Connect, and potentially Wear OS later.
- Game Engine / Quest Engine: avatar progression, XP economy, quests, verification confidence, anti-cheat, opt-in/privacy-preserving leaderboards, asynchronous competitions, ghost rivals, stamina/recovery balancing, and cosmetic unlocks. It connects to Avatar, Today, Training, Fuel, Move, Wearables, Progress, and AI Coach. It is governed by one inviolable rule: fitness progress cannot be purchased, it must be earned. See §26 and `docs/product/game-engine-architecture.md`.

Feature exploration rule: when evaluating any proposed capability, define the complete market-ready capability first. Do not recommend a lesser MVP version. Then define the engineering dependencies and milestones needed to implement it safely.

Every feature must feed at least one of the following:

- Today recommendation quality.
- Avatar state/evolution.
- Progress insight.
- Training, fuel, move, recovery, or safety outcome.
- Privacy, trust, accessibility, performance, or store readiness.

If a feature does not support these outcomes, challenge it before coding.

## 4. Target Architecture

Use a modular monorepo.

Recommended structure:

```text
apps/
  mobile/                  # Expo React Native iOS/Android app
  watch-ios/               # Native SwiftUI watchOS companion app
  admin/                   # Internal admin/support/content tooling
services/
  api/                     # Backend API, preferably NestJS TypeScript or equivalent
  ai-worker/               # Python/FastAPI worker service for AI/CV jobs
  jobs/                    # Scheduled jobs, sync, recap, notification jobs
packages/
  config/                  # Shared lint, tsconfig, env schema, constants
  contracts/               # Shared API DTOs, schemas, OpenAPI clients, event contracts
  rules-engine/            # Deterministic Today/training/fuel/recovery logic
  ui/                      # Shared UI primitives/design tokens where practical
  content-model/           # Exercise, workout, food, avatar content schemas
infra/
  terraform-or-pulumi/     # Infrastructure as code
  github-actions/          # CI/CD templates if separated
security/
  threat-models/           # Feature threat models
  reviews/                 # Security review notes
  policies/                # Privacy/security/app-store policy checklists
docs/
  adr/                     # Architecture Decision Records
  product/                 # PRDs and specs
  api/                     # API docs
```

Do not create a flat app with business logic scattered across screens. Domain logic belongs in domain services, hooks, repositories, or packages, not inside UI components.

## 5. Approved Baseline Stack

Use this stack unless an ADR explicitly changes it:

- Mobile: Expo React Native, TypeScript, React Navigation or Expo Router, TanStack Query for server state, Zustand or Redux Toolkit only when client state complexity justifies it.
- iOS Watch: SwiftUI/watchOS, HealthKit/WorkoutKit where appropriate.
- Backend API: NestJS TypeScript preferred for product API consistency. FastAPI Python is allowed for AI services and workers.
- Database: PostgreSQL. Use migrations. No manual schema drift.
- ORM/query layer: Prisma, Drizzle, or equivalent typed query layer. Raw SQL requires parameterization and review.
- Object storage: S3-compatible storage with signed URLs and lifecycle policies.
- Subscriptions: RevenueCat.
- Maps/GPS: Mapbox or Google Maps through an abstraction layer.
- Health integrations: HealthKit on iOS and Health Connect on Android through abstraction services. Do not call them directly from arbitrary UI components.
- AI: Structured calls through server-side AI services. Do not call paid AI APIs directly from mobile clients except where explicitly approved.
- Analytics: PostHog, Amplitude, or equivalent with privacy filtering. No raw health data, food photos, route polylines, body photos, or form videos in analytics.
- Error monitoring: Sentry or equivalent with PII scrubbing enabled.
- Feature flags: PostHog, Statsig, LaunchDarkly, or equivalent.

All third-party SDKs must be justified, reviewed, and documented before installation.

## 6. Required Standards

The codebase must align with these standards and references:

- NIST Secure Software Development Framework, SP 800-218.
- OWASP Mobile Application Security Verification Standard and Mobile Application Security Testing Guide.
- OWASP API Security Top 10 2023.
- OWASP Application Security Verification Standard for backend/API control expectations.
- Apple App Review Guidelines, especially Safety, Performance, Privacy, HealthKit, minimum functionality, account deletion, and public API requirements.
- Google Play User Data policy, Data Safety section requirements, Android Health permissions guidance, and Health Connect requirements.
- Platform-specific secure storage, permissions, privacy, and health data guidance.

When in doubt, choose the stricter interpretation.

## 7. Secure SDLC Workflow

Before implementing any meaningful feature, create or update the following:

1. PRD or feature brief.
2. Data classification note.
3. API contract or local interface contract.
4. Threat model when the feature touches auth, health, location, camera, photos, AI, subscriptions, payments, admin, or user-generated content.
5. Test plan.
6. Privacy impact note when the feature collects, infers, stores, transmits, or shares personal/sensitive data.
7. App-store review impact note when the feature touches health data, AI, camera, location, subscriptions, children/age, UGC, or user account deletion.

Use ADRs for durable architecture decisions.

Every PR must include:

- What changed.
- Why it changed.
- Security/privacy impact.
- Tests added/updated.
- Screenshots or screen recordings for UI changes.
- Migration notes if applicable.
- App-store/compliance notes if applicable.

## 8. AI Agent Coding Rules

AI agents must follow this workflow:

1. Branch and open a PR for every nontrivial change. Cut a typed branch (`feature/`, `fix/`, `security/`, `chore/`, `docs/`, `refactor/`) from the latest `main`, never commit or push to `main` directly, and land the work through a reviewed pull request. See §33.
2. Read relevant docs and existing code before editing.
3. State a concise implementation plan before code changes when the task is nontrivial.
4. Prefer adding tests before or alongside implementation.
5. Make the smallest coherent change.
6. Run or specify the exact checks that must pass.
7. Self-review for security, privacy, app-store, accessibility, and performance issues.
8. Do not claim a check passed unless it was actually run.

AI agents must not:

- Commit or push directly to `main`, force-push or delete `main`, or merge a PR that has not passed all required CI checks and CODEOWNERS review.
- Bypass, disable, downgrade, or skip a required CI gate (lint, types, tests, secret scan, SAST, CodeQL, dependency review, dependency audit, OSV, SBOM) to make a task pass.
- Replace working architecture with a simpler generated pattern.
- Install packages without checking maintenance, license, security posture, and bundle impact.
- Use `any`, `unknown` casts, disabled lint rules, or broad exception handling without written justification.
- Add `TODO`, `FIXME`, mock code, placeholder endpoints, fake auth, fake security, or fake persistence in production paths.
- Store tokens, health data, location data, photos, videos, or body metrics in insecure storage.
- Log sensitive data.
- Create direct client-to-AI integrations that expose API keys or bypass backend safety filters.
- Generate medical, diagnostic, or unsafe fitness/nutrition claims.
- Copy copyrighted workout content, YouTube videos, images, or avatar assets into the repo without documented rights.

## 9. Data Classification

Classify every new field, event, file, and payload.

### Public
Marketing copy, public app metadata, public documentation.

### Internal
Feature flags, internal docs, non-sensitive logs, release notes.

### Confidential
User profile, email, account state, subscription entitlement, support records.

### Sensitive Personal Data
Health data, fitness data, body metrics, weight, height, age, sex, goals, sleep, heart rate, HRV, steps, workouts, calories, macros, food logs, location, GPS routes, photos, videos, camera captures, form-check media, progress photos, wearable data, and AI-derived health/fitness inferences.

Sensitive personal data requires:

- Explicit purpose.
- Data minimization.
- Consent where required.
- Revocation path.
- Deletion path.
- Encryption in transit and at rest.
- No analytics leakage.
- No ad targeting.
- No sale or data broker sharing.
- Access controls.
- Auditability for admin access.
- Retention policy.

## 10. Privacy and Consent Rules

Implement privacy by design.

Required behavior:

- Request permissions only when needed for a visible user-facing feature.
- Explain why data is needed before the platform permission prompt.
- Provide alternatives when reasonable, such as manual entry if location, camera, health, or photo access is denied.
- Allow users to revoke permissions and continue using non-dependent features.
- Provide account deletion inside the app and via a web path if required by store policy.
- Provide deletion for uploaded food photos, progress photos, form videos, and health-derived data.
- Use explicit retention policies for raw images/videos. Default should be ephemeral or short-lived unless the user opts into saving.
- Keep privacy policy, app-store declarations, and actual app behavior aligned.
- Treat third-party SDK behavior as our responsibility.

Do not collect broad permissions “just in case.”

## 11. Health Data Rules

TEMPO is a fitness/wellness/coaching app, not a medical app.

Rules:

- Do not diagnose, treat, cure, monitor clinical conditions, or imply medical device capability.
- Do not provide tailored medical advice without qualified professional involvement and proper regulatory review.
- Do not imply form check prevents injuries.
- Do not imply food photo calories are exact.
- Do not use HealthKit, Health Connect, body sensor, camera, route, or nutrition data for ads, marketing, data mining, sale, credit, insurance, employment, or unrelated profiling.
- Do not write false, inflated, fabricated, or unverifiable health data to HealthKit/Health Connect.
- Do not store HealthKit personal health information in iCloud.
- Keep health data use tied to direct user benefit.
- Provide clear App Review/Play Console justifications for every health permission.

Health features must be phrased as coaching, estimates, trends, or informational support.

Preferred language:

- “Estimate.”
- “Likely range.”
- “Training cue.”
- “Readiness signal.”
- “This may help guide your workout.”

Avoid language:

- “Diagnosis.”
- “Guaranteed.”
- “Prevents injury.”
- “Clinically accurate.”
- “Medical recommendation.”
- “Exact calories.”
- “Safe for your condition.”

## 12. AI Safety and Model Governance

AI must be constrained, observable, and testable.

Architecture rules:

- AI outputs must use structured schemas wherever possible.
- AI must not directly write final health, workout, food, route, subscription, or avatar state without validation.
- The Today recommendation must be generated by deterministic rules first. AI may explain the result, suggest safe options, or summarize patterns.
- Food-photo AI must return estimates, confidence, likely range, detected foods, and correction prompts. User confirmation is required before final logging.
- Form-check AI must output non-medical training cues only. Use pose/keypoint logic when possible instead of relying only on LLM image interpretation.
- Every AI output shown to the user must pass safety filters for medical claims, eating-disorder risk, dangerous training advice, harassment, shame language, and unsupported certainty.
- Store AI prompts, model version, input hashes or metadata, output, validation result, and safety outcome where appropriate. Do not store raw sensitive inputs longer than necessary.
- Use red-team tests for unsafe advice, extreme dieting, body-shaming, minors, injury, pain, disordered eating, steroids, dehydration, and self-harm adjacent fitness behavior.

AI coach tone:

- Motivational but not reckless.
- Honest about uncertainty.
- No shame.
- No “beast mode” or “no pain no gain.”
- Serious around pain, fatigue, recovery, and under-fueling.

## 13. Authentication and Authorization

Rules:

- Use proven auth. Do not build custom password auth unless explicitly approved.
- Store tokens only in platform-secure storage: iOS Keychain, Android Keystore-backed storage, or vetted secure storage wrappers.
- Never store tokens in AsyncStorage, localStorage, unencrypted files, logs, crash reports, screenshots, analytics, or URLs.
- Enforce authorization on the server for every request.
- Every object-level read/write must verify ownership or explicit sharing rights.
- Add tests for BOLA/IDOR on every endpoint that uses IDs.
- Use least-privilege service roles.
- Admin endpoints require RBAC, MFA where possible, audit logs, and separation from normal user APIs.
- Do not trust client-side gating for subscription, ownership, health permissions, or admin access.

## 14. API Security

Backend APIs must defend against the OWASP API Security Top 10.

Required controls:

- Object-level authorization on every ID-based access.
- Function-level authorization on every privileged action.
- Property-level authorization for partial updates and serialization.
- Strict input validation at API boundary using schemas.
- Output allowlists. Do not return entire ORM objects.
- Rate limits and abuse limits on auth, AI, image upload, food search, route endpoints, and subscription webhooks.
- Request size limits.
- Pagination limits.
- Idempotency keys for important writes.
- SSRF protection for any URL ingestion.
- No mass assignment.
- No unsafe deserialization.
- No debug endpoints in production.
- Versioned API inventory.
- Structured error responses that do not leak internals.
- Audit logs for sensitive actions.

## 15. Mobile Security

Required controls:

- Use only public platform APIs.
- Do not download, install, or execute code that changes app features after review, except permitted OTA updates that comply with Apple/Google rules and do not alter native capabilities or review-sensitive behavior.
- No hidden features, reviewer evasion, or remote switches used to mislead app review.
- Remove debug menus and verbose logs from production builds.
- Disable Android backups for sensitive local data unless encrypted and explicitly justified.
- Use ProGuard/R8/minification where appropriate.
- Use iOS Keychain and Android Keystore-backed storage for secrets/tokens.
- Use TLS everywhere. Evaluate certificate pinning for production API calls with a documented rotation and failure strategy.
- Do not embed API secrets in the app bundle.
- Protect deep links and universal links against auth bypass.
- Validate route parameters and navigation state.
- Use safe image/video handling. Strip metadata when appropriate.
- Avoid full photo library access when a picker or scoped access is enough.
- Background location requires explicit user-facing purpose, foreground indicators where appropriate, and precise store disclosures.

## 16. Secure Storage and Cryptography

Rules:

- Use modern TLS for all network traffic.
- Encrypt sensitive data at rest using managed KMS or platform-approved mechanisms.
- Use AEAD ciphers such as AES-GCM or ChaCha20-Poly1305 through vetted libraries when application-level encryption is needed.
- Never invent cryptography.
- Never hardcode encryption keys.
- Use a managed secret store for backend secrets.
- Rotate keys and credentials.
- Hash passwords only through a vetted auth provider or approved algorithms such as Argon2id or bcrypt with appropriate parameters.
- Use CSPRNGs for tokens, nonces, reset codes, and IDs that require unpredictability.

## 17. Logging, Analytics, and Telemetry

Allowed:

- Non-sensitive operational events.
- Feature usage counts without raw health data.
- Aggregated performance metrics.
- Security events with safe metadata.

Not allowed:

- Raw health data in analytics.
- Food photos, progress photos, form videos, route polylines, GPS coordinates, or heart-rate streams in analytics.
- Prompt payloads containing sensitive user data in logs.
- Access tokens, refresh tokens, API keys, auth headers, cookies, one-time codes, payment identifiers, or PII in logs.
- Full request/response logging for sensitive endpoints.

All logs must have PII scrubbing and retention policies.

## 18. Database and Data Access

Rules:

- Use migrations for all schema changes.
- Every user-owned table must include owner/user scoping unless deliberately global reference data.
- Use foreign keys and constraints.
- Use typed repositories/services.
- Do not perform data access from UI components.
- Do not expose internal IDs without authorization checks.
- Prefer server-generated IDs.
- Use transactions for multi-step state changes.
- Use soft delete only where business/legal retention requires it; otherwise support real deletion for user-requested deletion flows.
- Document retention for every sensitive table.
- Consider row-level security or equivalent defense-in-depth for highly sensitive user-owned data.

## 19. Dependency and Supply Chain Security

Before adding a dependency, verify:

- It is necessary.
- It is maintained.
- It has a compatible license.
- It has no known critical/high vulnerabilities or abandoned transitive risks.
- It does not collect data unexpectedly.
- It does not bloat mobile bundle size unreasonably.
- It works with Expo/EAS or native build constraints.
- It has a clear removal path if needed.

Required controls:

- Lockfiles committed.
- Dependabot/Renovate enabled.
- Secret scanning enabled.
- Dependency vulnerability scanning enabled.
- SBOM generated for releases.
- License scanning for releases.
- Container scanning for backend/worker images.
- Third-party SDK inventory maintained.

## 20. App Store and Play Store Readiness

Apple submission readiness:

- App must be complete, stable, tested on-device, and have live backend services during review.
- Provide demo account or approved demo mode when account login is required.
- Do not submit placeholder screens, empty states pretending to be features, broken links, fake metadata, or incomplete in-app purchases.
- Ensure app is useful, unique, app-like, and not a repackaged website or generic template.
- Use public APIs only.
- Clearly disclose camera, location, health, AI, and subscription behavior.
- Provide account deletion in app if account creation exists.
- Provide privacy policy in App Store Connect and in app.
- HealthKit/fitness data use must directly support health/fitness user benefit and comply with HealthKit restrictions.

Google Play readiness:

- Complete Data Safety section accurately.
- Include privacy policy in Play Console and in app.
- Request only needed permissions.
- Provide clear prominent disclosure and consent before collecting sensitive/background data.
- Provide account deletion in app and via web path when required.
- Provide detailed justification for Health Connect and body sensor permissions.
- Do not request bulk health permissions without user-facing need.
- Ensure third-party SDKs match data declarations.

AI-generated code is not the issue by itself. Low-quality, template-like, incomplete, unsafe, misleading, unstable, or privacy-hostile apps are the issue. Build like a serious product.

## 21. Testing Requirements

Minimum checks for every PR:

- Type check.
- Lint.
- Format check.
- Unit tests.
- Relevant integration tests.
- API contract tests where endpoints changed.
- Authorization tests where user-owned data changed.
- Accessibility check for UI changes.
- Snapshot or visual regression where useful.
- No known high/critical dependency vulnerabilities without documented exception.

Additional checks by area:

### Mobile

- On-device smoke tests for iOS and Android before release.
- Detox/Appium E2E for onboarding, Today, workout logging, food logging, permission denial, account deletion, and subscription flow.
- Network offline/poor connectivity tests.
- Performance checks for workout screen, camera, maps, avatar animation, and food/photo upload flows.

### Backend

- API integration tests.
- Auth/authorization matrix tests.
- Rate-limit tests.
- Migration up/down tests when practical.
- Seed data tests.
- Webhook signature verification tests.

### AI

- Schema validation tests.
- Safety regression tests.
- Red-team prompts.
- Known-image/known-meal fixtures.
- Form-check fixtures.
- Latency and timeout tests.
- Fallback behavior tests.

### Privacy and Store Compliance

- Permission denial path tests.
- Revocation tests.
- Account deletion tests.
- Data export/delete tests.
- Privacy copy review.
- App review notes updated.

## 22. CI/CD Gates

CI should fail on:

- Type errors.
- Lint errors.
- Formatting errors.
- Test failures.
- Secrets detected.
- High/critical dependency vulnerabilities without approved exception.
- Missing migrations for schema changes.
- Generated API clients not updated after contract changes.
- Unsafe package scripts.
- Docker/container high/critical issues without approved exception.
- Missing security/privacy notes for sensitive features.

Recommended tools:

- TypeScript: `tsc --noEmit`, ESLint, Prettier.
- React Native: Expo/EAS checks, Detox/Appium for E2E.
- Backend: Jest/Vitest/Supertest for NestJS; Pytest for Python services.
- SAST: Semgrep.
- Secrets: Gitleaks or TruffleHog.
- Dependency scanning: OSV Scanner, npm/pnpm audit, pip-audit, Dependabot/Renovate.
- Containers: Trivy or Grype.
- IaC: Checkov or tfsec.
- Mobile security release gate: MobSF scan for release candidates.
- SBOM: CycloneDX.

## 23. Accessibility and UX Quality

Every screen must support:

- VoiceOver/TalkBack labels.
- Large tap targets.
- Sufficient color contrast.
- Dynamic text where practical.
- Reduced motion where animation is intense.
- Clear loading, empty, error, and offline states.
- No color-only status indicators.
- User control over notifications, location, camera, health, food photo AI, and form video storage.

Avatar-led branding is core, but usability wins inside critical flows.

## 24. Performance Requirements

Targets:

- Smooth navigation and animation on mid-range devices.
- Workout logging must remain responsive with one hand and poor network.
- GPS tracking must be battery-conscious.
- Camera/form-check flows must degrade gracefully.
- AI operations must be async where practical with visible progress and cancel/fallback options.
- Food photo upload must compress safely and avoid leaking metadata unless needed.
- Map views should avoid unnecessary re-renders and excessive tile/data usage.

## 25. Content and IP Rules

Do not use copyrighted videos, creator content, YouTube downloads, exercise libraries, avatar images, music, or brand assets without documented rights.

Exercise content must be:

- First-party.
- Licensed.
- Public domain with verified rights.
- Generated internally and reviewed.
- Approved partner content with documented usage rights.

No YouTube ripping. No unlicensed screenshots. No competitor asset copying. No copied workouts from paid programs.

## 26. TEMPO Domain Rules

### Today Engine

- Deterministic rules first.
- AI explanation second.
- Log recommendation inputs, outputs, version, and reason codes.
- Never recommend unsafe escalation when fuel, recovery, soreness, or pain flags are poor.
- User can adjust or override with clear warnings.

### Training Engine

- Store planned and actual workout data separately.
- Record sets with reps, weight, RPE, rest, completion status, and source.
- Smart swaps must respect equipment, pain flags, target muscle, movement pattern, and program intent.
- Pain/discomfort flow must reduce intensity and avoid diagnosis.

### Fuel Engine

- Food photo estimates must require confirmation.
- Store estimate ranges and user corrections.
- Do not present calories/macros as exact when AI-derived.
- Do not create shame-based copy around food.
- Guard against extreme deficit/surplus coaching.

### Move Engine

- Location access must be purpose-bound.
- Background tracking requires explicit disclosure and user control.
- Routes are sensitive. Treat GPS paths as sensitive personal data.
- Weather/location suggestions must have manual alternatives.

### Avatar Engine

- Avatar progression must avoid body shaming.
- Evolution reflects rhythm, energy, consistency, recovery, gear, confidence, and capability.
- Avatar unlocks must not manipulate unsafe behavior.
- Do not punish users visually for recovery, missed days, disability, injury, or under-fueling.

### Form Check

- Use “training cues,” not diagnosis.
- Show confidence/quality indicators.
- Require privacy controls for video storage.
- Provide skip/manual alternatives.
- Avoid “injury prevention” claims unless legally/clinically reviewed.

### Game Engine / Quest Engine

The Game Engine is a launch product pillar, not a gimmick or a bolt-on gamification layer. It turns real, verified fitness behavior into avatar progression, XP, quests, asynchronous competition, ghost rivals, and cosmetic unlocks, and it integrates with Avatar, Today, Training, Fuel, Move, Wearables, Progress, and AI Coach.

Prime rule:

- Fitness progress cannot be purchased. It must be earned. Strength, endurance, mobility, fuel, recovery, technique, rhythm, XP toward verified progress, levels, and competitive standing come only from real, verified activity — never from money.

Monetization rules:

- Paid purchases may unlock cosmetic and visual items only: cosmetics, skins, aura effects, arena themes, companion animations, and other non-performance visual items.
- Prohibited pay-to-win mechanics: paid strength, paid muscle, paid endurance, paid verified progress, paid XP that counts as real fitness progress, paid leaderboard advantage, permanent stat boosts, paid recovery overrides, paid stamina refills that confer competitive edge, or any mechanic that lets money substitute for real activity.
- Cosmetic catalog items must be modeled as cosmetic-only and non-performance-affecting at the type level (see `@tempo/contracts` game contracts) so a purchasable item can never carry a stat or competitive effect.

Verification and anti-cheat rules:

- Competitive XP and competitive standing require workout verification. Classify every workout as `unverified`, `standard`, `high_confidence`, or `suspicious`.
- Manual-only workouts can earn personal progress but only limited competitive XP.
- `high_confidence` requires corroborating evidence such as wearable, workout-session, heart-rate, motion, or location signals where available.
- `suspicious` workouts earn no competitive XP.
- Verification and anti-cheat logic is deterministic, tested business logic in `packages/rules-engine/src/game/`, not freeform AI output. AI may explain or summarize, never adjudicate fairness or write economy state directly.

Safety rules:

- Game mechanics must never reward unsafe escalation. Under-fueled, poorly recovered, pain-flagged, or over-loaded states reduce competitive rewards and trigger safety handling, not bonuses.
- More than two hard strength sessions in one day triggers diminishing returns or safety review unless strongly supported by corroborating signals.
- Recovery activities still earn recovery XP. Recovery, rest, and de-load are never penalized.
- Avatar progression must never punish missed days, injury, disability, recovery, or under-fueling.

Privacy rules:

- Game features may use sensitive fitness, health, location, and wearable signals only to benefit the user's own fitness experience (progression, verification, fairness, safety). Never for ads, behavioral profiling, creepy inference, manipulative monetization, data mining, or data sale.
- Leaderboards and ghost rivals are opt-in or privacy-preserving by default. Public standings use pseudonymous handles, never raw identity, unless the user explicitly opts to reveal it.
- No chat, comments, or open user-generated content is introduced by the Game Engine in its current scope.

## 27. Environment and Secrets

Rules:

- Never commit `.env` files with real secrets.
- Provide `.env.example` with safe placeholders.
- Validate environment variables at startup.
- Use separate dev/staging/prod projects and credentials.
- Use EAS secrets or platform secret stores for mobile builds.
- Rotate exposed credentials immediately.
- Do not print env values in logs.

## 28. Release Gates

No production release unless:

- All CI gates pass.
- Security scan is clean or exceptions are documented and approved.
- Privacy review is complete.
- App-store checklist is complete.
- Health permission justification is complete.
- Data Safety/App Privacy labels are updated.
- Account deletion works.
- Demo account/demo mode works for review.
- Backend is live and monitored.
- Crash-free smoke test passes on real iOS and Android devices.
- Rollback plan exists.

## 29. Definition of Done

A task is done only when:

- Code is implemented cleanly and idiomatically.
- Types are explicit.
- Tests exist and pass.
- Security/privacy impact is addressed.
- User-owned data access is authorized and tested.
- Errors, empty states, and loading states are handled.
- Accessibility is considered.
- Documentation is updated.
- CI passes.
- No temporary/demo/placeholder code remains in production paths.
- The implementation matches TEMPO product intent and brand direction.

## 30. Market-Ready Build Sequence and Release Rule

Build in dependency order, but do not redefine the product as an MVP. Foundation-first engineering is required because secure, complete super-app features depend on shared identity, permissions, data models, contracts, observability, and CI. This sequence is for implementation discipline only. It is not permission to launch a reduced product.

Launch is blocked until every defined market product pillar is real, reviewable, tested, secure, and represented accurately in the App Store and Google Play listings.

Required build sequence:

1. Monorepo setup with production-grade linting, type checks, testing, secret scanning, dependency scanning, and CI gates.
2. Shared contracts/config/types, including OpenAPI or typed API contracts and schema validation.
3. Mobile app shell with navigation, surreal performance design tokens, avatar-led brand system, accessibility baseline, error/loading/empty states, and responsive device support.
4. Auth, onboarding, profile, account deletion, consent, data export, privacy settings, and permission management.
5. Backend API with health checks, auth middleware, authorization policy, structured logging, rate limiting, env validation, OpenAPI, and audited admin boundaries.
6. Database schema and migrations for users, profiles, permissions, avatar, training, fuel, move, progress, recommendations, media, subscriptions, and audit/event history.
7. Today Engine v1 with deterministic rules, explainability inputs, recommendation history, test fixtures, and safety boundaries. This is a real product engine, not a stub.
8. Avatar system with archetype selection, state machine, evolution rules, asset model, unlocks, and integration with Today/Training/Fuel/Move/Progress.
9. Training Engine end-to-end: exercise library, workout plans, set logging, smart swaps, demo video model, pain/discomfort flow, and progression rules.
10. Fuel Engine end-to-end: food search, manual logging, barcode architecture, AI food-photo estimate pipeline, confidence ranges, correction flow, calorie/macro model, and energy balance.
11. Move Engine end-to-end: GPS activity tracking, routes, weather integration, Apple/Android permission handling, activity summaries, and location-aware suggestions.
12. Wearables: HealthKit, Apple Watch companion, Health Connect, health-data sync, permission revocation, and reconciliation.
13. AI Coach services: explanation generation, progress recaps, food-photo interpretation, conservative form cues, safety classifiers, prompt/version logging, and eval fixtures.
14. Form Check: camera flow, consent, pose/computer-vision pipeline, training cues, privacy controls, quality indicators, and non-medical safety copy.
15. Progress analytics: weekly/monthly summaries, body timeline, avatar evolution milestones, strength/nutrition/move/recovery trends, and retention loops.
16. Game Engine / Quest Engine: deterministic XP economy, level and diminishing-returns curves, workout verification confidence, anti-cheat classification, quests, avatar progression integration, opt-in/privacy-preserving leaderboards, asynchronous competitions, ghost rivals, stamina/recovery balancing, and cosmetic-only unlocks. The earn-not-buy rule and the safety/anti-cheat boundaries are launch-blocking. This is a real product engine, not a stub.
17. Subscriptions and entitlements: RevenueCat integration, paywalls, restore purchases, entitlement checks, app-store review notes, and server-side verification. Cosmetic-only monetization for the Game Engine; never sell fitness progress or competitive advantage.
18. Admin/content tooling: exercise management, video metadata, food-estimate review, feature flags, support tooling, audit trails, and moderation workflows.
19. Full release hardening: on-device testing, accessibility, performance, security testing, privacy review, app-store metadata, screenshots, demo reviewer account, backend readiness, incident runbooks, and support docs.

Agents may ship internal pull requests in this sequence, but may not describe early slices as launch-ready unless they satisfy the market-ready acceptance criteria for their domain.

## 31. Required Agent Response Pattern

For every nontrivial coding request, respond with:

1. What I’m changing.
2. Files I expect to touch.
3. Security/privacy risks.
4. Tests I will add/run.
5. Any assumptions or blockers.

After implementation, report:

1. What changed.
2. Tests/checks run and actual result.
3. Security/privacy notes.
4. Remaining work.

Do not overstate. If a test was not run, say it was not run.

## 32. Source References for This File

Use these as standing references when updating this file:

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play User Data policy: https://support.google.com/googleplay/android-developer/answer/10144311
- Google Play Data Safety section guidance: https://support.google.com/googleplay/android-developer/answer/10787469
- Android Health Permissions guidance: https://support.google.com/googleplay/android-developer/answer/12991134
- Android Health Connect docs: https://developer.android.com/health-and-fitness/health-connect
- OWASP Mobile Application Security project: https://owasp.org/www-project-mobile-app-security/
- OWASP API Security Top 10 2023: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- NIST SP 800-218 Secure Software Development Framework: https://doi.org/10.6028/NIST.SP.800-218

## 33. Branching and Pull Request Workflow

All nontrivial work happens on a typed branch and merges to `main` only through a reviewed pull request that passes every required CI gate. Direct commits and direct pushes to `main` are not allowed — for humans or for AI coding agents. `main` is protected; see `security/policies/branch-protection.md`.

Rules:

- Never commit or push directly to `main`. Never force-push or delete `main`.
- Start every change from a fresh branch cut from the latest `main`.
- Use a typed branch prefix that matches the work. Names are lowercase, kebab-case after the prefix, and describe the scope:
  - `feature/<scope>` — new product capability or engine work. Examples: `feature/auth-identity-foundation`, `feature/game-engine-foundation`.
  - `fix/<scope>` — bug fixes.
  - `security/<scope>` — security, CI, or supply-chain hardening. Example: `security/ci-pr-hardening`.
  - `chore/<scope>`, `docs/<scope>`, `refactor/<scope>` — supporting work.
- Open a pull request for every branch and fill out the PR template completely: what changed, why, data classification (§9), security/privacy impact (§7), tests run with actual results (§8, §31), and app-store/compliance impact (§20).
- A PR may merge only when all required checks pass — quality (format, lint, typecheck, tests), secret scan, dependency review (vulns + license deny-list), Semgrep SAST, CodeQL, OSV-Scanner, dependency audit, and SBOM — and a CODEOWNERS review is approved.
- Never bypass, disable, downgrade, or force-merge past a required check, and never merge a PR that still needs the requested human review.
- Keep PRs small and coherent. Split large engine work into milestone PRs per §2 and §30, each tied to launch-quality acceptance criteria.
- Dependency-update PRs (Dependabot) follow the same protected flow and CI gates; they are reviewed, not auto-applied.

