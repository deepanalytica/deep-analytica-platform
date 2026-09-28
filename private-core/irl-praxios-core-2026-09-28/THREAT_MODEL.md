# PRAXIOS Threat Model v0.2

## Protected assets

- provider API keys;
- canonical session state;
- evidence provenance;
- human authorizations;
- executor capabilities;
- audit ledger;
- persisted research data;
- decisions and artifacts.

## Adversaries and failure sources

- malicious or compromised model output;
- prompt injection in retrieved evidence;
- accidental model hallucination;
- hostile browser input;
- authorization replay;
- payload substitution after approval;
- disabled-tool bypass;
- ledger tampering;
- persistence theft;
- API abuse and oversized requests;
- cross-origin browser calls;
- provider timeout or partial failure;
- operator configuration error.

## Main mitigations

### Model output is untrusted

Model output passes schema contracts before it becomes state. Worker claims are not considered verified. Independent review is recorded separately.

### Prompt injection

Workers receive scoped tasks. Model output cannot call executors directly. External effects require an action object, policy evaluation and human approval.

### Payload substitution

Authorization stores the exact normalized action. Execution compares the authorized action with the action presented to the executor.

### Replay

Authorizations are single-use. Once consumed, the same authorization cannot execute again.

### Tool privilege

Executor metadata defines effect, tags, enabled state and risk class. Caller-provided metadata cannot downgrade executor effect.

### Disabled tools

Disabled executors acquire the executor_disabled wall and are unavailable before authorization.

### Persistence

Production binding requires a 32-byte PRAXIOS_DATA_KEY. Snapshots use AES-256-GCM authenticated encryption.

### API authentication

Non-local binding requires PRAXIOS_SERVER_TOKEN for runtime calls and a separate PRAXIOS_HUMAN_TOKEN for approval and decision endpoints. Comparisons use timing-safe equality. The model-provider path never receives the human-authority credential.

### Browser isolation

CORS uses an explicit allow-list. API responses are no-store and include restrictive headers.

### Resource exhaustion

Request size, request rate, task count, provider calls, input size, output size, wall-clock time and provider timeout are bounded.

### Tampering

Ledger entries form a SHA-256 hash chain. Each event also contains a checkpoint digest of canonical state.

## Residual risks

- A bearer token is still a bearer credential; compromise grants API access.
- File-backed persistence is appropriate for a single-writer service, not horizontal multi-writer scaling.
- Model independence is not statistical independence.
- Provider-side retention and jurisdiction depend on provider account configuration.
- Human approval can authorize a bad decision; the system constrains process, not human judgment.
- The built-in runtime does not yet provide hardware-backed key storage.

## Deployment assumptions

For public deployment:

- TLS is terminated by the hosting platform;
- encrypted persistent volume is mounted;
- server token and data key are stored as platform secrets;
- API provider keys never enter the browser;
- CORS is restricted to the public Control Room origin.
