# PRAXIOS Expert Audit Guide v0.2

## Scope

This guide is designed for independent review by software engineering, security, AI assurance, distributed systems, HCI, epistemology and domain-science reviewers.

## Start here

1. runtime/core/praxios-runtime.mjs
2. runtime/core/meta-harness.mjs
3. runtime/core/policy.mjs
4. runtime/core/contracts.mjs
5. runtime/core/orchestrator.mjs
6. runtime/core/decision-room.mjs
7. runtime/core/ledger.mjs
8. runtime/server.mjs
9. runtime/tests/

## Reproduce

From the repository root:

    node --check runtime/server.mjs
    node --test runtime/tests/*.test.mjs
    node scripts/validate_site.mjs
    node scripts/validate_data.mjs
    python scripts/topology_synthetic.py

## Negative tests reviewers should inspect

- same actor proposes and verifies;
- independent review missing;
- same provider/model reviewer;
- cyclic task DAG;
- unknown dependency;
- action without authorization;
- approval attempted with runtime credential but without human-authority credential;
- action mutated after approval;
- authorization replay;
- disabled executor;
- insufficient claim identifiability;
- wrong encryption key;
- ledger tampering;
- unauthenticated API call;
- oversized request;
- resource budget overflow.

## Questions for adversarial review

### Runtime

- Can any provider output reach an executor without PRAXIOS?
- Can a failed task cause a dependent task to execute?
- Can a planner construct an unbounded graph?

### Meta-Harness

- Are PASS, REVIEW and BLOCK aggregated correctly?
- Can action metadata downgrade a registered executor?
- Can approval be replayed or applied to a modified action?

### Evidence

- Are evidence identifiers and provenance preserved?
- Can a claim reference missing evidence?
- Does uncertainty survive normalization?

### Human authority

- Are high-impact actions structurally unavailable before approval?
- Does the server expose any route by which a model can authorize itself?

### Audit

- Can a persisted snapshot be changed without breaking audit?
- Are state checkpoints consistent with the event chain?

## Acceptance criteria

An audit should not rely on the UI animation. Reviewers should inspect runtime state transitions and tests directly.

A release is accepted only when:

- all runtime tests pass;
- site/data validators pass;
- no secrets are present in tracked files;
- production configuration requires encryption and authentication;
- public UI labels local fixture mode separately from remote provider mode;
- the exact commit under review is identified.
