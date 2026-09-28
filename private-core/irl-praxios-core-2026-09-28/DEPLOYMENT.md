# PRAXIOS production deployment

## Railway target

The repository includes runtime/Dockerfile and railway.json.

The service exposes /api/health and listens on the platform-provided PORT.

Required production variables:

- PRAXIOS_SERVER_TOKEN
- PRAXIOS_HUMAN_TOKEN
- PRAXIOS_DATA_KEY
- PRAXIOS_CORS_ORIGIN
- at least one configured model provider key/model pair.

Recommended:

- HOST=0.0.0.0
- PRAXIOS_DATA_DIR=/data
- attach a persistent volume mounted at /data.

The runtime refuses to bind to a non-localhost interface unless runtime authentication, a separate human-authority credential, and encrypted persistence are configured.

## Frontend connection

Open praxios.html, choose Connect backend, and provide the public runtime URL, PRAXIOS bearer token, and provider/model assignments.

Provider API keys remain server-side.

## Production acceptance gate

1. CI passes.
2. /api/health reports encryptedPersistence: true.
3. Browser origin matches PRAXIOS_CORS_ORIGIN.
4. Audit of a test session returns ok: true.
5. An effectful action fails without authorization.
6. The exact action succeeds once after human approval.
7. Authorization replay fails.
