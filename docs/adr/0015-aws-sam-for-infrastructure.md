# ADR-0015: AWS SAM for infrastructure as code

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** Deployment, environment separation (project summary CI section)

## Context

The project summary names CloudFormation or SAM. CDK in Python was proposed as an alternative — same language as the application, with real control flow instead of YAML templating, and materially better ergonomics for Step Functions state machines (ADR-0004).

**SAM was chosen.** It matches the summary's stated intent, and it is purpose-built for the serverless shape this project actually has: scheduled Lambdas, a state machine, and object storage. Its local invoke and testing story for Lambda is the strongest of the options, which matters for a pipeline whose correctness depends on ingest validation and point-in-time logic being testable in isolation.

The known cost is YAML verbosity as the state machine and Dev/UAT/Prod separation grow.

## Decision

We will use AWS SAM, with three conventions that address the verbosity concern directly.

**1. The Step Functions definition lives in its own file.** The state machine is authored as Amazon States Language in a separate `.asl.json`, referenced from the SAM template via `DefinitionUri`, never inlined as YAML. This is the single most effective mitigation: it keeps the largest and most-edited structure out of the template, makes it independently validatable, and gives it a readable diff.

**2. Environments are parameters, not copies.** One template, parameterised by environment, deployed as three stacks (`finevents-dev`, `finevents-uat`, `finevents-prod`) with per-environment config files. Never three divergent templates — that is how environments drift apart and how "works in UAT" stops meaning anything.

**3. Nested stacks once the template grows.** Split by concern — ingest, pipeline, storage — rather than allowing one monolithic template.

**Deployment is one command per environment**, satisfying the summary's one-click requirement, with production gated on manual approval.

**The Streamlit frontend is out of SAM's scope.** Streamlit needs a container (ADR-0006) and SAM does not model that well. It gets its own deployment path — App Runner or Fargate — defined separately. The stack is therefore not purely SAM-managed, and that boundary should be explicit rather than discovered later.

## Alternatives considered

- **AWS CDK in Python.** Rejected in favour of SAM. CDK offers a single language across app and infrastructure, loops and conditionals for the multi-environment setup, and considerably better Step Functions authoring. Set aside for consistency with the project summary and SAM's stronger local-testing story. The `.asl.json` convention above recovers most of the Step Functions ergonomics gap.
- **Raw CloudFormation.** Rejected: most verbose option, with no serverless shorthand and no local invoke.
- **Terraform.** Rejected: not in the summary, and adds a non-AWS-native toolchain for no benefit at this scale.

## Consequences

- Excellent local Lambda testing, which directly serves the ingest-validation and point-in-time test requirements.
- One deploy command per environment; production gated.
- Template growth is a live risk. The three conventions above are mitigations, not a cure — if the template becomes unmanageable despite them, that is the revisit trigger.
- No programmatic abstraction: repeated structure across the three environments is handled by parameters, which covers most cases but not all.
- Two deployment paths exist (SAM for serverless, separate for the Streamlit container), so the deploy story is not literally one command for the whole system.
- Requires AWS account setup with per-environment isolation — still an open decision.

## Revisit trigger

The SAM template exceeds roughly 1,000 lines despite nested stacks and the externalised state machine, **or** environment divergence appears that parameters cannot express — at which point CDK becomes the migration target.
