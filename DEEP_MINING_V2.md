# Deep Mining Intelligence V2

V2 convierte el dashboard inicial en una superficie de decisión y anticipación.

## Abrir

Ruta protegida: `/mining-v2`

Configurar en el entorno:

```
DMI_ACCESS_PASSWORD=<strong password>
DMI_SESSION_SECRET=<32+ random chars>
DMI_SESSION_TTL_SECONDS=43200
```

La contraseña real nunca se guarda en GitHub. El login genera una cookie HttpOnly firmada y el middleware protege toda la ruta V2.

## Qué incluye

- Decision Command Bar: capital, horizonte, confianza y siguiente bloqueo.
- Geo / Temporal Twin: canvas WebGL orbitable con Superficie / Sección / Subsuelo y capas.
- Scenario Compare: capital, horizonte, retorno de escenario, reversibilidad e incertidumbre.
- Evidence Rail: evidencia, arquitectura, pruebas y matemática.
- Meta-Harness visible: bloqueos y advertencias antes de una decisión.
- Praxios Action Rail: flujo hasta aprobación humana.
- `rust-core/`: implementación canónica mínima del gate engine.

## Honestidad del prototipo

La geometría y cifras incluidas en V2 están marcadas como DEMO. El canvas está listo para sustituirse por terreno, 3D Tiles y capas reales de Deep Geo. Los tests Rust están definidos en código, pero no deben mostrarse como ejecutados hasta que CI ejecute `cargo test`.

La UI no presenta forecasts como hechos ni escenarios como recursos declarados.
