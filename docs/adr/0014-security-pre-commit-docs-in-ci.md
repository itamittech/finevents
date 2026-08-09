# ADR-0014: Security checks pre-commit, documentation checks in CI

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** Project summary hooks requirement; supports ADR-0001

## Context

The project summary specifies pre-commit security and credential scanning, and a **post-commit** documentation check. The post-commit placement does not work as intended: a post-commit hook runs *after* the commit already exists, so it can only warn. By the time it fires, the undocumented change is in history.

The two check types have genuinely different requirements:

- **Secrets must never enter history.** Once committed, removal means rewriting history — and if the branch was pushed, coordinating that rewrite across everyone. The check must block *before* the commit object is created. This is inherently local and pre-commit.
- **Documentation currency needs full-diff context.** Whether a change required a doc update is a property of the whole change set, not of one commit. A mid-branch commit may legitimately lack docs that a later commit in the same PR adds.

The repo is intended to be public (project summary), which raises the cost of a leaked credential considerably.

## Decision

Security checks run **pre-commit** where they can block. Documentation checks run **in CI on pull request** where they have full context.

**Pre-commit (blocking, local), via the `pre-commit` framework:**

| Check | Tool | Blocks on |
|---|---|---|
| Credential detection | gitleaks or detect-secrets | Any detected secret |
| Environment files | pattern rule | `.env`, `*.pem`, `credentials*` staged |
| Python SAST | bandit | High-severity findings |
| Dependency vulnerabilities | pip-audit | Known CVEs in dependencies |
| Scraped data | pattern rule | Data files staged (ADR-0002: data never enters the repo) |

**CI on pull request (blocking merge):**

- **Documentation currency** — changes under mapped source paths require corresponding documentation changes. The mapping lives in config, not hardcoded.
- **Requirement reference** — the PR references at least one REQ-id or ADR, enforcing ADR-0001's traceability chain.
- Full test suite, lint, type checks.

**An explicit escape hatch exists.** A `docs: n/a — <reason>` marker in the PR body satisfies the documentation check for genuinely doc-free changes. This is deliberate: without a sanctioned escape, people reach for `--no-verify` or force-merge, which disables *every* check rather than the one that did not apply. A visible, justified exemption is safer than a bypassed hook.

**Pre-commit hooks are kept fast.** Anything slow enough to make developers bypass hooks belongs in CI. Speed is a security property here, not a convenience.

## Alternatives considered

- **Post-commit documentation check** as originally specified. Rejected: cannot enforce, only warn, because the commit already exists.
- **Everything pre-commit.** Rejected: doc checks lack full-diff context mid-branch and would produce false failures; slow hooks drive `--no-verify` usage, which disables the security checks that genuinely need to be local.
- **Everything in CI.** Rejected: a committed secret has already entered history by the time CI runs. For a public repo, assume any pushed secret is compromised and must be rotated regardless of removal.

## Consequences

- Secrets are blocked at the only point where blocking actually prevents the problem.
- Documentation enforcement gains the full-diff context that makes it meaningful rather than noisy.
- Contributors need `pre-commit install` as a setup step — must be in `Contributing.md`, and CI should verify hooks ran.
- The source-path-to-doc mapping needs maintenance as the project grows; a stale mapping silently stops enforcing.
- The escape hatch can be abused. Exemptions are visible in PR history and should be reviewed periodically for patterns.
- Pre-commit cannot be fully trusted — it is bypassable by design. CI re-runs the secret scan as a backstop.

## Revisit trigger

A secret reaches the public repo despite the hooks, **or** `docs: n/a` exemptions exceed roughly 20% of PRs (indicating the mapping is wrong or the check is not earning its cost).
