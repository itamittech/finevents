# ADR-0054: Python 3.13, uv, pytest, moto, GitHub Actions

- **Status:** Accepted
- **Date:** 2026-08-10
- **Serves:** REQ-1104, REQ-1113, REQ-1114, REQ-1117
- **Closes:** T0.13

## Context

The Python version was carried through the whole specification record as *the one irreversible choice* — [Execution.md](../Execution.md) increment 0 and [`project-deliverables-diagram.svg`](../design/project-deliverables-diagram.svg) both state it as `Chronos-2 wheels ∩ TimesFM 2.5 wheels ∩ SAM Lambda runtimes ∩ AgentCore base image`, and T0.13 requires it verified *before* the T0.8 scaffold. Get it wrong and increment 9 forces a rebuild of everything below it.

**The intersection was measured, not assumed.** Resolution was run for CPython 3.12, 3.13 and 3.14 against `aarch64-manylinux_2_28` — AgentCore Runtime accepts only `linux/arm64` images, so aarch64 is the binding platform, and its documented base image is Debian 12 (`glibc` 2.36), which satisfies `manylinux_2_28`. Lambda's managed Python runtimes sit on Amazon Linux 2023 (`glibc` 2.34), which also satisfies it.

| Constraint | Measured value | Binds? |
|---|---|---|
| `chronos-forecasting` 2.3.1 | `requires-python >=3.10`; ships `py3-none-any` — a pure-Python wheel | No |
| `timesfm` 2.0.2 | `requires-python >=3.10`; ships `py3-none-any`; **Apache-2.0** | No |
| `torch` 2.13.0 (transitive, the only compiled dependency that matters) | `cp310`–`cp314`, `manylinux_2_28_aarch64` **and** `_x86_64` | No |
| AWS Lambda managed runtimes | `python3.13` (Nov 2024) and `python3.14` (Nov 2025), both runtime and container base image | No |
| AgentCore Runtime | `linux/arm64` **only**; documented base image is `python3.13-bookworm-slim` | No |

**The intersection is 3.12 ∪ 3.13 ∪ 3.14, and all three resolve to a byte-identical pin set** (`torch==2.13.0`, `numpy==2.5.2`, `pandas==3.0.5`, `transformers==5.14.1`, `accelerate==1.14.0`, 68 packages). The constraint the project feared for a year is **not binding**. That is worth recording plainly, because the fear shaped the sequencing: T0.13 was treated as increment 0's dominant cost and it is not.

A naming trap, since it caused a false negative during this check: **TimesFM 2.5 is a model checkpoint, not a package version.** The PyPI distribution that serves it is `timesfm` 2.0.2. Searching for a "timesfm 2.5" release finds nothing and looks like an availability problem.

The remaining choices — packaging, test runner, AWS mocking, CI — are reversible, and are decided here only so the scaffold has one answer rather than a survey.

## Decision

We will build on **CPython 3.13**, pinned as `requires-python = "==3.13.*"`.

We will use:

| Concern | Choice |
|---|---|
| Packaging and lockfile | **uv**, with `uv.lock` committed |
| Test runner | **pytest**, with **Hypothesis** for the `P`-coded requirements |
| AWS mocking (unit) | **moto** |
| AWS substrate (integration) | **Docker Compose** — DynamoDB Local and MinIO, already specified in [Design §8](../Design.md) |
| CI | **GitHub Actions** |

**3.13 over 3.14** because the deciding factor is no longer wheel availability but exposure. 3.13 has had a Lambda managed runtime since November 2024 and is what AgentCore's own documentation builds against; 3.14's runtime is nine months old. Both resolve today, so the choice costs nothing to make conservatively, and support to October 2029 outlives the build.

**3.13 over 3.12** because 3.12 buys a year less support for no compatibility gain — the pin set is identical.

`uv.lock` is universal — it carries every platform's resolution behind markers, so a lock produced on the Windows development host still yields the correct aarch64 wheels under `uv sync` on Linux. The platform target matters at **export**: any `requirements.txt` generated for the AgentCore container build must pass `--python-platform aarch64-manylinux_2_28`, or it omits the Linux-only `nvidia-*` and `triton` chain and produces an image that fails on first import.

## Alternatives considered

**Python 3.14.** Rejected on exposure, not capability — see above. Cheap to revisit: the pin set is identical, so the migration is a one-line `requires-python` change and a `uv lock` re-run.

**Poetry.** Lost to uv on resolution speed and on native cross-platform resolution — `--python-platform` is what makes an aarch64 lockfile producible from a Windows host at all, which this project needs on day one.

**LocalStack instead of moto.** Rejected as *duplicative rather than wrong*: Design §8 already commits to Docker Compose with DynamoDB Local and MinIO for the integration substrate, which is the layer LocalStack would occupy. moto is chosen for the unit layer, where an in-process fake beats a container.

**Container image for the Lambda functions.** Rejected for increment 0 — the managed `python3.13` runtime deploys faster and the pipeline Lambdas carry no compiled dependencies. The AgentCore container is where `torch` lives, and it is built separately (T11.5). Revisit if any Lambda ever needs a wheel Lambda's runtime does not carry.

## Consequences

**Easier.** T0.8 can proceed — it was gated on this. The scaffold, the lockfile and the container base image all name one version. The development host already runs 3.13.7, so local and deployed interpreters agree without a version manager.

**Harder.** The lockfile is now platform-targeted, which means `uv sync` on a Windows host does *not* reproduce the deployed environment. Local test runs use a host-resolved environment and CI runs the locked one; a dependency that works locally and fails in CI is now a possible and non-obvious failure. CI runs on `ubuntu-latest`, which catches it before deploy.

**New work.** The lockfile must be regenerated for both `aarch64-manylinux_2_28` (AgentCore) and the Lambda runtime target whenever dependencies change; T11.5 must build with `--platform linux/arm64`, since an x86 build produces *silent* import errors on AgentCore rather than a build failure.

**Cleared incidentally.** *"Confirm TimesFM 2.5's licence before it enters a public repo's build"* — one of the ten pre-build verification items in [`aws-architecture.md`](../design/aws-architecture.md) — is answered here: **Apache-2.0**, compatible with this repository's own licence (ADR-0044).

## Revisit trigger

Any of:

- A required dependency ships no `cp313` `manylinux_2_28_aarch64` wheel, and no source build is viable inside the container budget.
- AWS announces a deprecation date for the Lambda `python3.13` runtime.
- Chronos-2 or the TimesFM 2.5 checkpoint publishes a `requires-python` floor above 3.13.
