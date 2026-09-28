# PRAXIOS Runtime + Meta-Harness v0.2

This directory contains the executable control plane used by the public Control Room.

## Runtime

PRAXIOS owns canonical state, task scheduling, providers, executors, authorization requests, decisions, persistence and audit events.

Meta-Harness owns epistemic and action gates.

Decision Room turns governed state into a human decision package.

## Run locally

Requires Node.js 20 or later.

    cd runtime
    node --test tests/*.test.mjs
    node server.mjs

Health:

    GET http://127.0.0.1:8787/api/health

## Production requirements

When HOST is not localhost, startup fails unless both are set:

- PRAXIOS_SERVER_TOKEN
- PRAXIOS_HUMAN_TOKEN
- PRAXIOS_DATA_KEY

PRAXIOS_SERVER_TOKEN authenticates runtime calls. PRAXIOS_HUMAN_TOKEN is a separate credential accepted only by approval and decision endpoints. PRAXIOS_DATA_KEY must decode to exactly 32 bytes. Production snapshots are encrypted with AES-256-GCM.

Use runtime/.env.example as the configuration reference.

## Model providers

Built-in server adapters:

- OpenAI
- Anthropic
- FixtureProvider for deterministic tests and the public local demonstration.

Provider keys never enter the browser.

Planner, worker and verifier use explicit provider/model slots. PRAXIOS validates planner DAGs and worker/verifier contracts before their output is admitted into canonical state.

## Worker / verifier separation

Workers produce evidence and claims.

Verifier receives already-registered claims and returns reviews. It does not create replacement claims during verification.

Claims that require independent review cannot pass REVIEW_COVERAGE without a recorded review from the declared verifier.

## Action security

Executor registry metadata is authoritative for:

- effect;
- tags;
- enabled state;
- risk class.

Effectful actions require authorization. Authorization is bound to the exact normalized action and is single-use.

## Persistence

Local development may use FileSessionStore.

Production mode uses EncryptedFileSessionStore when PRAXIOS_DATA_KEY is set.

Snapshots contain:

- canonical state;
- task state;
- ledger.

Restored sessions are audited before the server accepts them.

## Audit

Each ledger entry contains a previous hash and SHA-256 event hash. Event payloads also contain canonical-state checkpoint hashes.

Audit endpoint:

    GET /api/sessions/:sessionId/audit

## API

Machine-readable API contract:

- runtime/openapi.yaml

## Deploy

The repository includes runtime/Dockerfile and railway.json.

See ../DEPLOYMENT.md.
