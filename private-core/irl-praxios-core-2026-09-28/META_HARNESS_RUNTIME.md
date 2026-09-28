# Meta-Harness Runtime v0.2

## Definition

Meta-Harness is the policy decision point between model output and accepted claims or executable actions.

## Claim gates

Current gates:

1. EPISTEMIC_CLASS
2. PROVENANCE
3. EVIDENCE
4. CONTRADICTION
5. UNCERTAINTY
6. IDENTIFIABILITY
7. ROLE_SEPARATION
8. REVIEW_COVERAGE
9. MODEL_INDEPENDENCE
10. PUBLICATION_POLICY when applicable
11. AUDIT

## Verdict aggregation

\[
Verdict(G)=\begin{cases}
BLOCK & \exists g_i=BLOCK,\\
REVIEW & \exists g_i=REVIEW\land\nexists BLOCK,\\
PASS & \forall g_i=PASS.
\end{cases}
\]

## Review coverage

A claim with requireIndependentReview=true cannot pass without a recorded review from the declared verifier.

## Model independence

Different actor identifiers are required structurally. If proposer and verifier still use the same provider/model, Meta-Harness returns REVIEW for MODEL_INDEPENDENCE.

## Action gates

Actions pass through:

- hard walls;
- required-claim dependencies;
- exact authorization binding;
- audit integrity.

## Walls

Default walls include:

- secret export;
- ledger bypass;
- disabled executor;
- unregistered executor.

## Authorization

Authorization is:

- explicit;
- human-bound at the server API boundary;
- tied to the exact normalized action;
- single-use.

A changed payload or replay produces BLOCK.

## Claim dependency

An action can declare requiredClaimIds and claimThreshold=PASS.

This prevents an action from treating a REVIEW claim as an established premise when the action requires verified claims.
