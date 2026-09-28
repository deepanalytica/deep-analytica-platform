# PRAXIOS Control Room — UI Specification v0.3

## One session, three lenses

\[
S_t\rightarrow\{Operate,Assure,Decide\}.
\]

### Operate / PRAXIOS

Displays tasks, dependencies, model slots, execution state, retries and ledger events.

### Assure / Meta-Harness

Displays claim class, reviews, provenance, contradictions, uncertainty, identifiability and gate verdicts.

### Decide / Decision Room

Displays situation, filtered findings, unknowns, options, human authorization and selected outcome.

## Local mode

The public page imports the actual PRAXIOS core and Meta-Harness modules and runs them with FixtureProvider.

This mode exercises real state transitions, gates, authorizations, walls and ledger integrity without exposing external provider credentials.

## Remote mode

Connect backend opens a configuration dialog for:

- API base URL;
- PRAXIOS runtime token;
- separate human-authority token;
- planner provider/model;
- research provider/model;
- math provider/model;
- verifier provider/model.

The browser sends orchestration requests to runtime/server.mjs. OpenAI and Anthropic keys remain server-side.

## Untrusted rendering

Model-derived text is escaped before insertion into the DOM.

## Human authority

Approve and Reject buttons call the server authorization endpoint in remote mode. Approval is not equivalent to execution; execution is a separate governed transition.

## Audit

The Ledger inspector can run local or remote audit and report whether canonical state matches the hash-chain checkpoint.
