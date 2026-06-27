# Branch Protection & PR-Based CI Policy

Status: Active
Applies to: `BrainBurst59/tempo-app`, branch `main`
Owner: @BrainBurst59

## Policy

`main` is protected. All nontrivial work happens on a typed feature branch and
merges to `main` **only** through a reviewed pull request that passes every
required CI gate. Direct commits and direct pushes to `main` are not allowed —
for humans or for AI coding agents (see CLAUDE.md / AGENTS.md §33).

Branch naming (minimum):

| Prefix      | Use                                     | Example                            |
| ----------- | --------------------------------------- | ---------------------------------- |
| `feature/`  | New product capability / engine work    | `feature/auth-identity-foundation` |
| `feature/`  | New product capability / engine work    | `feature/game-engine-foundation`   |
| `security/` | Security, CI, or supply-chain hardening | `security/ci-pr-hardening`         |
| `fix/`      | Bug fixes                               | `fix/today-reason-codes`           |
| `chore/`    | Tooling / housekeeping                  | `chore/bump-eslint`                |
| `docs/`     | Docs only                               | `docs/threat-model-move`           |
| `refactor/` | Internal refactor, no behavior change   | `refactor/rules-engine-split`      |

## Required status checks

A PR may merge only when all of these pass. Contexts come from the workflow
**job names**; pick the exact contexts in the GitHub UI (or via the ruleset
below) **after the workflows have run once** so GitHub knows they exist.

| Check (job name)          | Workflow                                 | Gate                                |
| ------------------------- | ---------------------------------------- | ----------------------------------- |
| `Typecheck, lint, tests`  | `.github/workflows/ci.yml`               | format, lint, typecheck, unit tests |
| `Secret scan`             | `.github/workflows/ci.yml`               | gitleaks                            |
| `Dependency review`       | `.github/workflows/ci.yml`               | new-dep vulns (high) + license deny |
| `Semgrep SAST`            | `.github/workflows/semgrep.yml`          | SAST (OSS rule packs)               |
| `CodeQL`                  | GitHub default setup (repo setting)      | semantic SAST → code scanning       |
| OSV-Scanner (PR scan)     | `.github/workflows/osv-scanner.yml`      | diff-aware dependency vulns         |
| `pnpm audit (high+)`      | `.github/workflows/dependency-audit.yml` | advisory feed, blocks high/critical |
| `Generate CycloneDX SBOM` | `.github/workflows/sbom.yml`             | SBOM artifact produced              |

> The OSV-Scanner job runs through a reusable workflow, so its check context is
> reported as `scan-pr / <inner job>`. Select the exact string from the PR's
> checks list the first time it runs.

> CodeQL runs via **GitHub default setup** (Settings → Code security → CodeQL
> analysis), which covers `actions`, `javascript`, and `typescript` — the
> `actions` pack is what flags unpinned third-party actions. Default setup and a
> committed advanced `codeql.yml` workflow are **mutually exclusive** (an
> advanced workflow fails with a "configuration error" while default setup is
> on), so this repo intentionally ships **no** `codeql.yml` and the required
> context is `CodeQL`. To switch to an advanced workflow instead, first disable
> default setup, then add the workflow.

## Apply protection (GitHub Ruleset — recommended)

Rulesets are the modern, layerable replacement for classic branch protection.
Edit `required_status_checks` to match the exact contexts after the first run,
then apply:

```bash
gh api -X POST repos/BrainBurst59/tempo-app/rulesets \
  --input security/policies/main-ruleset.json
```

Where `main-ruleset.json` is:

```json
{
  "name": "Protect main",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": { "include": ["refs/heads/main"], "exclude": [] }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "require_code_owner_review": true,
        "dismiss_stale_reviews_on_push": true,
        "require_last_push_approval": true,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "Typecheck, lint, tests" },
          { "context": "Secret scan" },
          { "context": "Dependency review" },
          { "context": "Semgrep SAST" },
          { "context": "CodeQL" },
          { "context": "pnpm audit (high+)" },
          { "context": "Generate CycloneDX SBOM" }
        ]
      }
    }
  ]
}
```

Notes:

- `non_fast_forward` + `deletion` block force-pushes and deletion of `main`.
- `require_code_owner_review` enforces `.github/CODEOWNERS`.
- `strict_required_status_checks_policy: true` requires the branch to be up to
  date with `main` before merge.
- Repo admins are subject to the ruleset by default (no bypass actor is added
  above). To temporarily allow an emergency admin bypass, add a `bypass_actors`
  entry — but the standing policy is **no bypass**.

## Apply protection (classic branch protection API — alternative)

```bash
gh api -X PUT repos/BrainBurst59/tempo-app/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Typecheck, lint, tests",
      "Secret scan",
      "Dependency review",
      "Semgrep SAST",
      "CodeQL",
      "pnpm audit (high+)",
      "Generate CycloneDX SBOM"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true,
    "require_last_push_approval": true
  },
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "restrictions": null
}
JSON
```

## Recommended repository settings

```bash
# Auto-delete head branches after merge.
gh api -X PATCH repos/BrainBurst59/tempo-app -f delete_branch_on_merge=true

# Require PRs to be squash- or rebase-merged (linear history); disable merge commits if desired.
gh api -X PATCH repos/BrainBurst59/tempo-app -F allow_squash_merge=true -F allow_rebase_merge=true
```

Already enabled on the repo (keep on): secret scanning, secret scanning push
protection. Recommended to enable: Dependabot security updates (this PR adds
`.github/dependabot.yml` for version updates).

## Verifying

```bash
# Show the active ruleset(s) on main.
gh api repos/BrainBurst59/tempo-app/rulesets

# Confirm a direct push to main is rejected (expect a protected-branch error).
git push origin HEAD:main   # must fail once protection is active
```
