<!--
TEMPO pull request. Every nontrivial change ships on a feature branch and merges
to `main` only through this PR (see CLAUDE.md / AGENTS.md §33). Fill out every
section. Do not delete headings — write "N/A" with a one-line reason instead.
-->

## What changed

<!-- The change in plain language. -->

## Why

<!-- The product/engineering reason. Link the issue, ADR, or spec. -->

## Branch / scope

- Branch prefix: <!-- feature/ | fix/ | security/ | chore/ | docs/ | refactor/ -->
- Engine / area: <!-- e.g. Auth, Today, Training, Fuel, Move, Avatar, Game, CI -->

## Data classification

<!-- Classify every new field/event/file/payload touched (CLAUDE.md §9):
Public / Internal / Confidential / Sensitive Personal Data.
If none, state "No new data collected/stored/transmitted." -->

- [ ] No new data is collected, inferred, stored, transmitted, or shared
- [ ] This PR touches **Sensitive Personal Data** (health, body, location/GPS,
      photos/video, wearable, food, or AI-derived health/fitness inferences)

Classification + purpose:

## Security / privacy impact

<!-- Required (CLAUDE.md §7). Cover auth/authorization, ownership checks
(BOLA/IDOR), input validation, secrets handling, logging/PII, encryption,
permissions, and third-party SDK behavior as applicable. -->

- [ ] No new secrets are committed; `.env.example` updated if env vars added
- [ ] No sensitive data added to logs, analytics, or crash reports
- [ ] Object-level authorization verified/tested for any ID-based access
- [ ] Threat model added/updated if this touches auth, health, location,
      camera, photos, AI, subscriptions, payments, admin, or UGC

Notes:

## Tests run

<!-- List the exact checks you ran and the ACTUAL result. Do not claim a check
passed unless it was run (CLAUDE.md §8, §31). -->

- [ ] `pnpm format`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] Authorization / privacy-path tests where user-owned data changed
- [ ] Other (describe):

Result:

## App-store / compliance impact

<!-- Required when this touches health data, AI, camera, location,
subscriptions, age/children, UGC, or account deletion (CLAUDE.md §7, §20).
Otherwise state "No app-store impact." -->

- [ ] No App Store / Play impact
- [ ] Apple App Privacy / Play Data Safety declarations need updating
- [ ] Health permission justification updated
- [ ] Account-deletion / data-export paths verified

Notes:

## Screenshots / recordings

<!-- Required for UI changes. -->

## Migration notes

<!-- DB migrations, contract/client regeneration, or rollout/rollback steps. -->

## Reviewer checklist

- [ ] All required CI checks pass (quality, secret scan, dependency review,
      Semgrep, CodeQL, OSV-Scanner, dependency audit, SBOM)
- [ ] CODEOWNERS review obtained
- [ ] No temporary/demo/placeholder code in a production path (CLAUDE.md §29)
