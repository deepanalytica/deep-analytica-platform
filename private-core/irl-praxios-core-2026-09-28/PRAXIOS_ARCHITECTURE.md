# PRAXIOS / Meta-Harness / Decision Room — Architecture v0.2

## Purpose

PRAXIOS is the execution runtime. Meta-Harness is the policy and assurance layer. Decision Room is the human authority surface.

The system is organized around a canonical state rather than a chat transcript.

\[
S_t = \{goal,evidence,claims,tasks,authorizations,actions,decisions,artifacts\}.
\]

## Runtime cycle

\[
OBSERVE\rightarrow REASON\rightarrow PROPOSE\rightarrow VERIFY\rightarrow AUTHORIZE\rightarrow EXECUTE\rightarrow OBSERVE.
\]

Every state transition is written to the tamper-evident ledger.

## Components

### PRAXIOS Runtime

- canonical state;
- deterministic task scheduler;
- provider registry;
- executor registry;
- execution budgets;
- authorization requests;
- persistence and restoration;
- event ledger.

### Meta-Harness

Meta-Harness is the policy decision point.

It evaluates claims through:

- epistemic class;
- provenance;
- evidence;
- contradiction;
- uncertainty;
- identifiability;
- proposer/verifier separation;
- review coverage;
- model independence;
- publication policy;
- audit integrity.

It evaluates actions through:

- structural walls;
- claim dependencies;
- authorization;
- audit integrity.

### Policy enforcement point

Executors are the policy enforcement boundary. A model never receives a direct executor handle.

\[
model\ output\rightarrow PRAXIOS\ proposal\rightarrow MetaHarness\rightarrow authorization\rightarrow executor.
\]

### Decision Room

Decision Room projects the same canonical state into:

- situation;
- evidence;
- findings;
- unknowns;
- excluded claims;
- risks;
- options;
- pending authorizations;
- human decision;
- outcome.

Claims with BLOCK are excluded from findings.

## Trust boundaries

1. Browser UI is untrusted presentation code.
2. Runtime API is the server trust boundary.
3. Model providers are untrusted reasoning components.
4. Meta-Harness is the policy decision point.
5. Executor registry is the policy enforcement point.
6. Human authorization is a separate authority transition.
7. Persistence is encrypted in production mode.

## Provider independence

Planner, worker and verifier slots reference capabilities through provider/model identifiers.

PRAXIOS does not depend on a single model vendor.

The verifier can use a different provider/model. If proposer and verifier use the same provider/model, Meta-Harness surfaces MODEL_INDEPENDENCE as REVIEW.

## No chain-of-thought dependency

The runtime records tasks, evidence, claims, reviews, gates, hashes, model-call metadata and final outputs. It does not require hidden chain-of-thought.

## Failure semantics

- provider failure -> task FAILED after bounded retries;
- dependency failure -> dependent task BLOCKED;
- invalid contract -> orchestration rejected;
- wall -> action structurally BLOCKED;
- missing human authorization -> BLOCK;
- authorization replay -> BLOCK;
- executor failure -> authorization remains consumed and ACTION_EXECUTION_FAILED is recorded;
- ledger/state mismatch -> audit BLOCK.


## Human authority credential boundary

Production deployments use a separate human-authority credential for approval and decision endpoints. Runtime/model orchestration credentials cannot approve their own effects.
