# Deep Living — Estado auditable del software
Fecha de corte documental: **2026-10-27**. Rama: `feat/deep-living-decision-intelligence`. PR: https://github.com/deepanalytica/deep-analytica-platform/pull/10.
Regla: **implementado** no significa **validado en producción**. Ninguna venta demostrada ni datos territoriales reales habilitados.

| Módulo | Estado técnico confirmado por código | Estado de prueba / limitaciones |
|---|---|---|
| React / Vite / TypeScript | Implementado | CI previa verde; revisar CI del último commit |
| DLS v1 tokens, responsive | Implementación parcial | Faltan component library, dark mode coherente, regresión visual/axe |
| Pro inventario, demandas, match | Implementado inicialmente | Matching determinista con cartera, no portal nacional |
| Operations 8 etapas | Implementación inicial RPC/RLS | Requiere QA con Supabase real, roles y casos concurrentes |
| PreCheck y documentos | Implementación preliminar | Verificación jurídica humana obligatoria |
| Decision Intelligence | Motor Monte Carlo didáctico | Datos sintéticos, sin calibración ni persistencia |
| OperationPulse | Parcial | Consulta/escrituras principales; no telemetría de todas las vistas |
| **Business Location** | **Nuevo motor + UI + tests** | Manual/local, sin mapa externo ni fuentes reales; CI/QA aún por certificar en este registro |
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
- Business Location: **L1**, a promover a L2 solo tras comprobar tests/build del último commit.
- Decision Intelligence: L2 en cálculos, L1 en producto real por simulaciones no calibradas.
- Mapas/normativa/cobros: L0.

## Bloqueos y siguiente gate
1. Comprobar el último GitHub Actions; capturas desktop/móvil y errores.
2. Definir contrato `DecisionCase` + persistencia RLS antes de guardar casos privados.
3. Conectar primera fuente nacional oficial/abierta con licencia, fecha, escala y cobertura visibles.
4. Integrar telemetría real transversal y E2E de cancelación/fallo.
5. Validar precio y disposición a pagar con usuarios reales **antes** de implementar checkout en producción.

Actualización de estado: añadir fecha, HEAD, workflow URL, números exactos de tests, captura si existe, y lista de tareas pendientes. No modificar porcentajes de progreso por intuición.
