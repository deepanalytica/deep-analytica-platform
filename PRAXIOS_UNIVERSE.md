# PRAXIOS Universe — Vertical Slice v0.1

Branch: `feat/praxios-universe-webos-v1`

## Purpose

This vertical slice makes the architecture visible without pretending that the UI is the runtime itself.

Implemented surfaces:

- Genealogy: Super Prompt Euler → χ → EL PUENTE → harness family → mathematical harness → EL ENGRANAJE → The Shark → Meta-Harness → PRAXIOS OS → Control & Decision Room.
- Cross the Bridge interactive mission entry.
- Deterministic demo API at `POST /api/praxios-universe/demo`.
- Claims / evidence inspector.
- Meta-Harness membrane and gates.
- The Shark + Stop Gate.
- Append-only-style Live Trace visualization.
- Book of Audacities card.
- Inverse Reality Lab candidate-history visualization.
- Explicit synthetic/demo labeling to prevent false scientific authority.

## Important boundary

The current API is deliberately a deterministic structural demo. It does **not** call the canonical PRAXIOS Rust runtime, Meta-Harness engine, Deep Geo instruments or an external evidence source yet.

Therefore:

- user input is never promoted to independent evidence;
- no scientific verification is claimed;
- no causal or operational conclusion is emitted;
- final status remains REVIEW when the Afuera is absent.

## Preview deployment

GitHub Actions workflow:

`.github/workflows/praxios-universe-preview.yml`

Worker:

`praxios-universe-preview`

Route after deployment:

`/praxios-universe`

This preview worker is isolated from the existing `deep-mining-intelligence-v2` worker.
