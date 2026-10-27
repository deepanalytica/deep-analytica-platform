# Deep Living — Estado auditable del software
Fecha de corte documental: **2026-10-27**. Rama: `feat/deep-living-decision-intelligence`. PR: https://github.com/deepanalytica/deep-analytica-platform/pull/10.
Regla: **implementado** no significa **validado en producción**. Ninguna venta demostrada ni datos territoriales reales habilitados.

| Módulo | Estado técnico confirmado por código | Estado de prueba / limitaciones |
|---|---|---|
| React / Vite / TypeScript | Implementado | 33 tests, build TS/Vite y regresión PostgreSQL/RLS verdes en SHA fb7ff846; falta QA visual/E2E |
| DLS v1 tokens, responsive | Implementación parcial | Faltan component library, dark mode coherente, regresión visual/axe |
| Pro inventario, demandas, match | Implementado inicialmente | Matching determinista con cartera, no portal nacional |
| Operations 8 etapas | Implementación inicial RPC/RLS | Requiere QA con Supabase real, roles y casos concurrentes |
| PreCheck y documentos | Implementación preliminar | Verificación jurídica humana obligatoria |
| Decision Intelligence | Motor Monte Carlo didáctico | Datos sintéticos, sin calibración ni persistencia |
| OperationPulse | Parcial | Consulta/escrituras principales; no telemetría de todas las vistas |
| **Business Location** | **Nuevo motor + UI + tests** | Manual/local, sin mapa externo ni fuentes reales; CI verificado: workflow 40526854347, 33/33 pruebas unitarias y build Vite/TypeScript correctos; QA visual todavía sin completar por bloqueo de Chromium |
| Deep Geo | No integrado | No presentar riesgos por ubicación ni datos geoespaciales como verificados |
| Pagos y suscripciones | No implementados | Precios son hipótesis; no hay checkout |
| Informes pagados y CRM nacional | Previsto | No está listo para comercialización |

## Cambios implementados en la rama
- `src/location-fit-engine.ts`: 6 perfiles, 1–6 alternativas, presupuestos, margen, equilibrio, proyecciones sin descuento, escenarios 70/100/130 %, bloqueos y evidencia marcada.
- `tests/location-fit-engine.test.ts`: tests para aritmética, presupuesto, escenarios, datos faltantes, reglas declaradas e independencia geográfica.
- `src/BusinessLocation.tsx` y `src/business-location.css`: wizard lateral por actividad, edición de alternativas, KPI económicos, sensibilidad, estado de revisión y comparador responsive.
- `src/App.tsx`: nueva entrada INTELIGENCIA → Ubicación para negocios.
- Registros de producto/continuidad en docs, AGENTS.md y Notion.

## Límites explícitos
La ubicación ingresada no se geocodifica; la cantidad de paraderos/competidores, distancia, movilidad, accidentes, permisos, crime, riesgo y mercado son desconocidos hasta integración legítima. La rentabilidad calculada proviene de unidades mensuales **supuestas por el usuario**, no de pronósticos del sistema.

## Matriz de madurez
- L0: concepto; L1: código local; L2: pruebas automatizadas; L3: QA visual/E2E; L4: datos licenciados y validados; L5: operación real.
- Business Location: **L1**, **L2** por 33 tests + build del commit fb7ff846; no promueve a L3 por falta de QA visual/E2E.
- Decision Intelligence: L2 en cálculos, L1 en producto real por simulaciones no calibradas.
- Mapas/normativa/cobros: L0.

## Bloqueos y siguiente gate
1. Reconfirmar CI de HEAD posterior a documentación; ejecutar QA desktop/móvil. Chromium local devolvió ERR_BLOCKED_BY_ADMINISTRATOR al acceder a localhost; no se obtuvo una captura válida.
2. Definir contrato `DecisionCase` + persistencia RLS antes de guardar casos privados.
3. Conectar primera fuente nacional oficial/abierta con licencia, fecha, escala y cobertura visibles.
4. Integrar telemetría real transversal y E2E de cancelación/fallo.
5. Validar precio y disposición a pagar con usuarios reales **antes** de implementar checkout en producción.

Evidencia CI: https://github.com/deepanalytica/deep-analytica-platform/actions/runs/40526854347 (SHA fb7ff846632525ad5fa578a541922bdb913d23b8; 33 passed, 0 failed; PostgreSQL/RLS success). El control externo Vercel aparece fallido/bloqueado; no implica fallo del workflow propio. Artefacto descargable válido de Actions, sin despliegue publicado. QA Chromium bloqueado por política del entorno. Actualización futura: anotar nuevo HEAD y nueva CI después de cambios de documentos, no inventar validación visual.
