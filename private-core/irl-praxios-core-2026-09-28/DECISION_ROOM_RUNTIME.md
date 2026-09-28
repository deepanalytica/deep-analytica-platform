# Decision Room Runtime v0.2

## Role

Decision Room is a projection of canonical PRAXIOS state for human judgment.

It does not create evidence and does not verify claims.

## Package construction

For a session state:

\[
D_t = \{Situation,Evidence,Findings,Unknowns,Excluded,Risks,Options,Authorizations\}.
\]

The implementation maps:

- PASS claims -> findings;
- REVIEW claims -> unknowns;
- BLOCK claims -> excludedClaims.

## Options

An option may declare requiresClaimIds.

DecisionRoom validates that every required claim is PASS before allowing selection.

## Human selection

Selection is a separate state transition recorded as DECISION_SELECTED.

The runtime requires authorityType=human for decision selection.

## Relationship to authorization

Decision and authorization are separate concepts.

A human may select an option without granting a side effect unless the corresponding authorization is also approved.

This avoids treating a UI choice as an executor capability.
