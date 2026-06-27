# Security Policy

TEMPO is an AI-assisted fitness product that handles sensitive personal and
health-related data. We take the security and privacy of that data seriously and
welcome reports from the security community.

## Reporting a vulnerability

Please report suspected security vulnerabilities **privately** through GitHub
Private Vulnerability Reporting:

- Open the repository's **Security** tab and choose **Report a vulnerability**, or
  use the direct link:
  https://github.com/BrainBurst59/tempo-app/security/advisories/new

This creates a private security advisory visible only to you and the maintainers.

**Please do not open public issues, pull requests, or discussions for suspected
vulnerabilities**, and please do not disclose details publicly until we have had a
reasonable opportunity to investigate and ship a fix. Coordinated disclosure
protects users while remediation is in progress.

## What to include

A clear report helps us reproduce and fix an issue quickly. Where possible,
include:

- A description of the vulnerability and its potential impact.
- The affected component, file, endpoint, or version/commit.
- Step-by-step reproduction steps or a minimal proof of concept.
- Relevant logs, requests, or screenshots, with sensitive data redacted.
- Your assessment of severity and any suggested remediation.

Please test only with synthetic or test accounts and data. Do not include real
users' personal or health data in a report.

## Supported versions and project status

TEMPO is in active, pre-release development. There are no long-term-support or
maintenance releases at this stage. Security fixes are applied to the `main`
branch and the current development line; older commits, feature branches, and
pre-release builds are not separately maintained. This section will be updated
with supported version ranges as the product approaches a public release.

## Our commitment

- We make a good-faith effort to acknowledge, triage, and investigate valid
  reports, and to keep you informed of meaningful progress toward a fix.
- We are happy to credit reporters who would like to be acknowledged, with their
  permission.
- We do **not** currently run a paid bug-bounty program and make no promise of
  monetary reward. Reports are accepted and valued on a voluntary, good-faith
  basis.

We intentionally do not publish specific response-time guarantees at this stage;
we will respond as promptly as our resources allow.

## Safe harbor

We support good-faith security research. We will not pursue or support legal
action against researchers who:

- Make a good-faith effort to follow this policy.
- Report findings promptly and privately through the channel above.
- Avoid privacy violations, data destruction, and service disruption.
- Give us a reasonable opportunity to remediate before any public disclosure.

If you are unsure whether a specific action is permitted, ask us first through a
private report. Good-faith research conducted under this policy will not be
treated as a violation of our terms.

## Rules of engagement (out of scope)

To protect our users and partners, the following are **not authorized** under
this policy:

- Destructive testing, including modifying or deleting data you do not own.
- Exfiltration of data, or accessing, storing, or retaining other users' personal
  or health data.
- Denial-of-service or resource-exhaustion testing, load testing, or spam.
- Social engineering, phishing, or physical attacks against TEMPO users, staff,
  or contractors.
- Testing, scanning, or attacking third-party services and dependencies used by
  TEMPO (for example identity, analytics, payment, mapping, storage, or
  infrastructure providers). Report issues in those services directly to their
  respective providers.

A finding that can only be demonstrated by one of the activities above is out of
scope. When in doubt, stop and contact us privately.

---

This policy applies to this repository and may be updated as the product matures.
