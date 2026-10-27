# Próxima conexión del agente — Deep Living OS
**Actualizado:** 2026-10-27. Destino: `feat/deep-living-decision-intelligence`, PR #10. Notion: https://app.notion.com/p/406c569163ac810e908be444c16bb4cd

## Qué hacer al volver (en este orden, sin suponer estado)
1. Leer `AGENTS.md`, `docs/SOFTWARE_STATUS.md`, `docs/PRODUCT_STRATEGY_V2.md`, `docs/PROCESS_ACTIVITY.md`, `docs/DECISION_INTELLIGENCE.md`.
2. Consultar PR #10, HEAD, diff y estado de GitHub Actions más reciente, comparar con este documento. Revisar rama base `feat/deep-living-os` y conflictos; mantener sin fusionar hasta gates.
3. Compilar: `cd products/deep-living-os && npm install --no-audit --no-fund && npm run check`. Registrar número exacto de pruebas, SHA y workflow.
4. QA navegable: `/?app=1` → INTELIGENCIA → Ubicación para negocios; verificar distintas actividades, ediciones de casos, comparación, presupuesto insuficiente, uso incompatible, ausencia de datos, 320/390/768/1440 px, teclado y modo reducido.
5. Corregir bugs con commits pequeños y actualizar estado y Notion tras cada entrega significativa.

## Backlog priorizado de aceptación
### DL-P0-01 Business Location
- [x] Motor puramente determinista de costes + punto de equilibrio + restricciones declaradas.
- [x] UI responsive con dos candidatos demo editables y seis perfiles.
- [x] Tests unitarios añadidos.
- [ ] CI verde del último commit + QA visual/E2E verificados.
- [ ] Prueba con 5–10 usuarios reales, registrar sus preguntas y falsos supuestos.
### DL-P1-02 DecisionCase persistido
- [ ] Definir esquema versionado (caso, alternativas, objetivos, permisos, auditoría).
- [ ] Implementar CRUD RPC y migración RLS aislada por org/usuario.
- [ ] Tests multi-tenant y exportación/eliminación de datos.
### DL-P1-03 Activity telemetry v2
- [ ] Contrato tipado de eventos, eventos por consulta/cálculo/guardado/documento.
- [ ] Grafo con estados pending/running/completed/blocked/failed/cancelled y fuente de progreso.
- [ ] Control de cancelación, reintentos idempotentes y reduced-motion.
### DL-P2-04 Evidencia nacional
- [ ] Revisar licencia, costo y cobertura de 1 fuente geográfica.
- [ ] Adaptador `SourceAdapter` + caches solo cuando permitido + tests.
- [ ] Mapa real con procedencia e indicadores no disponibles explícitos.
### DL-P3-05 Comercialización
- [ ] Landing por actividad y analytics de funnel respetando consentimiento.
- [ ] Reporte versionado según evidencia disponible y límite de cobertura.
- [ ] Checkout sandbox + idempotencia, devolución y soporte; precios por validar.
### DL-P4-06 Escala
- [ ] Buyer, Invest, Inmuebles y Pro sobre `DecisionCase` común.
- [ ] Módulos geoespaciales intensivos y backtesting para modelos de riesgo/mercado.

## Datos que el siguiente agente DEBE dejar en el cierre
SHA inicio → SHA final; commits y links; cambios de estado por módulo; tests exactos con logs; URL de preview solo si comprobada; problemas/fallos/blocked; próxima acción ejecutable y tareas actualizadas en Notion.

## No hacer
No inventar precio comercial, volumen peatonal, delincuencia, estacionamientos, permisos, tiempos de viaje ni probabilidades de catástrofe por dirección. No automatizar perfilamiento sensible de propietarios. No mezclar demo con datos reales. No incluir claves privadas en la web. No afirmar producción por CI verde.
