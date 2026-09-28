# PRAXIOS Runtime v0.2

## Definition

PRAXIOS is the executable control plane that owns canonical state and the transition from a goal to governed work.

\[
OBSERVE\rightarrow REASON\rightarrow PROPOSE\rightarrow VERIFY\rightarrow AUTHORIZE\rightarrow EXECUTE\rightarrow OBSERVE.
\]

## Implemented modules

- runtime/core/praxios-runtime.mjs
- runtime/core/scheduler.mjs
- runtime/core/orchestrator.mjs
- runtime/core/contracts.mjs
- runtime/core/budget.mjs
- runtime/core/decision-room.mjs
- runtime/core/ledger.mjs
- runtime/core/policy.mjs
- runtime/core/meta-harness.mjs

## Canonical state

Models do not own session state.

\[
S_t=\{goal,evidence,claims,tasks,authorizations,actions,decisions,artifacts\}.
\]

## Planner / workers / verifier

The planner proposes an acyclic task DAG.

Workers produce evidence and claims.

The verifier reviews existing claims and cannot replace their proposer identity.

PRAXIOS records provider/model metadata and makes model-level independence visible.

## Contracts

Planner, worker, verifier, evidence, claim, task and action structures are validated before admission into canonical state.

## Budgets

ExecutionBudget bounds:

- tasks;
- provider calls;
- input characters;
- output characters;
- wall-clock duration;
- per-provider timeout.

## Scheduler

Tasks execute only after declared dependencies reach COMPLETED. Retries are bounded and deterministic.

## Executors

Executors are registered capabilities with authoritative metadata:

- effect;
- tags;
- enabled state;
- risk class.

Unknown and disabled executors are structural walls.

## Persistence

Local development supports file snapshots. Production supports AES-256-GCM encrypted snapshots.

## Server

runtime/server.mjs exposes the controlled API. Non-local binding requires authentication and encrypted persistence.

## Public Control Room

praxios.html can run the core locally with a fixture provider or connect to the remote runtime. Provider API keys remain on the server.
