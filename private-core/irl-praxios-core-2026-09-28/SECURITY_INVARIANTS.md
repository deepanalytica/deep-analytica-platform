# PRAXIOS Security and Assurance Invariants

These invariants are intended to be machine-testable.

## I-01 Canonical state

A model response cannot directly mutate canonical state. Mutation occurs only through PRAXIOS methods.

## I-02 Proposer / verifier separation

\[ proposerId = verifierId \Rightarrow BLOCK. \]

## I-03 Review coverage

A claim marked requireIndependentReview cannot pass without a recorded review by the declared verifier.

## I-04 Action wall precedence

If any structural wall matches an action, authorization cannot make the action executable.

## I-05 Human authorization

Configured effectful actions require an APPROVED authorization produced through the human-authority API boundary. In production, runtime authentication and human authority use separate credentials.

## I-06 Exact action binding

\[ authorizedAction \neq executionAction \Rightarrow BLOCK. \]

## I-07 Single use

\[ authorization.consumed = true \Rightarrow reuse = BLOCK. \]

## I-08 Executor authority

Executor registry metadata is authoritative for effect and enabled state.

## I-09 Dependency safety

A task executes only after all declared dependencies reach COMPLETED.

## I-10 Audit integrity

A session is auditable only when both the event hash chain and state checkpoint agree.

## I-11 Provider isolation

Provider API keys exist only in the server environment and are never serialized into session snapshots.

## I-12 Bounded execution

Provider calls and task expansion are bounded by ExecutionBudget.

## I-13 Decision filtering

Decision Room findings contain PASS claims. REVIEW claims appear as unknowns. BLOCK claims are excluded.

## I-14 Failure persistence

Executor failure consumes the authorization, records ACTION_EXECUTION_FAILED and cannot silently retry the same authorization.
