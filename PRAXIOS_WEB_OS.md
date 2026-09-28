# PRAXIOS Web OS v1

Branch: `feat/praxios-webos-v1`

## Purpose

A full operational UI for the existing PRAXIOS runtime contract in `deepanalytica/inverse-reality-lab/runtime`.

The app deliberately separates:

- execution state (PRAXIOS);
- claim/action assurance (Meta-Harness);
- adversarial inspection (The Shark);
- evidence/provenance (The Outside);
- decision selection (Decision Room);
- effectful authorization (human authority);
- event/audit trace (ledger).

## Route

`/praxios`

## Modes

### Local Fixture

Browser-local, deterministic and persistent through localStorage.

It exists for:

- UI development;
- investor demos;
- gate-behavior demonstrations;
- offline testing.

It does **not** call an LLM and does not pretend that synthetic evidence is independent evidence.

### Remote Runtime

The browser calls the Next.js gateway:

`/api/praxios-runtime/[...path]`

The gateway calls the canonical PRAXIOS runtime server.

Runtime bearer credentials and the true human-authority credential remain server-side.

## Required environment for Remote Runtime

```bash
PRAXIOS_RUNTIME_URL=https://runtime.example.com
PRAXIOS_RUNTIME_TOKEN=...
PRAXIOS_HUMAN_TOKEN=...
PRAXIOS_APP_ADMIN_TOKEN=...
```

The UI operator enters only `PRAXIOS_APP_ADMIN_TOKEN` for human-authority operations. It is stored in browser sessionStorage and is exchanged by the gateway for the server-side human token.

## Implemented UI surfaces

- Mission Overview
- Mission creation / remote session attachment
- Governed orchestration (planner → workers → verifier)
- Evidence Registry
- Claim Assurance / independent review / Meta-Harness gates
- Control & Decision Room
- Action proposal
- Claim-bound authorization requests
- Human approval / denial
- Single-use execution
- Event Ledger
- Runtime Audit
- Architecture
- Runtime/Security settings

## Security defaults

- Remote runtime unconfigured by default.
- Human-authority proxy requires a separate app-admin token.
- Runtime bearer and human tokens are never returned to the browser.
- Route metadata is `noindex,nofollow`.
- The existing corporate website is not part of this deployment.

## Canonical runtime compatibility

Remote mode targets the current v0.2 endpoints:

- `GET /api/health`
- `GET /api/providers`
- `POST /api/sessions`
- `GET /api/sessions/:id`
- `POST /api/sessions/:id/evidence`
- `POST /api/sessions/:id/claims`
- `POST /api/sessions/:id/claims/:claimId/review`
- `POST /api/sessions/:id/claims/:claimId/verify`
- `POST /api/sessions/:id/authorizations`
- `POST /api/sessions/:id/authorizations/:authorizationId`
- `POST /api/sessions/:id/actions/execute`
- `POST /api/sessions/:id/decisions/:decisionId/select`
- `GET /api/sessions/:id/audit`
- `POST /api/orchestrate`

## Acceptance gate

1. `npm ci`
2. `npx tsc --noEmit`
3. fixture mission survives create → evidence → claim → review → verify → decision/action → audit
4. remote gateway never exposes runtime tokens
5. authority writes fail without app-admin token
6. no changes to `deepanalytica.cl`
