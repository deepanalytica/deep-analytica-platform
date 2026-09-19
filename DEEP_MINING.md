# Deep Mining Intelligence v0.1

MVP para inversionistas y operadores que necesitan decidir dónde asignar el próximo tramo de capital.

## Núcleo

Praxios OS orquesta el flujo. Meta-Harness bloquea saltos epistemológicos y decisiones de alto impacto sin llave humana.

Ontología persistente mínima: Project, Source, Evidence, Claim, Forecast, Risk, Decision, AuditEvent.

`Claim.epistemic_level` evita multiplicar tablas: fact → inference → hypothesis → recommendation. Cada nivel conserva evidencia e incertidumbre.

## Flujo

Contexto → evidencia → claims → series/forecast → alternativas → riesgos → Meta-Harness → decisión humana → audit.

TimesFM entra como adaptador de forecasting, no como fuente de verdad. Un forecast necesita series fuente, backtest, baseline e intervalo predictivo. Si no supera baseline, pierde peso decisional.

Deep Geo entra como proveedor espacial de evidencia y contexto; esta versión no duplica su stack.

## Demo

Abrir `/mining`. Los datos incluidos son demostrativos y están marcados como DEMO DATA.

API mínima: `POST /api/mining/evaluate` con `{"decisionId":"D1"}`.

## Siguiente conexión real

1. Aplicar la migración Supabase.
2. Sustituir `demo.ts` por repositorio Supabase.
3. Conectar worker TimesFM 2.5 por HTTP.
4. Consumir capas/servicios de Deep Geo.
5. Añadir aprobación humana persistida + audit event.
