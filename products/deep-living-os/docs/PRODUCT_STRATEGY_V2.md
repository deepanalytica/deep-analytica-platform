# Deep Living · Product Strategy / UX / Pricing v2
Fecha: 2026-10-27. **Hipótesis comercial y arquitectura objetivo; no implica implementación total.**

## JTBD principal
«Estoy considerando comprar o arrendar una propiedad —particularmente una oficina o local para mi actividad— y necesito saber si esa ubicación me conviene, cuánto me costará y qué información debería verificar antes de comprometerme».
Mercado: cualquier comuna de Chile. Cobertura de **datos** variable; la UI informa qué fuentes existen en cada zona.

## Familias de decisión
1. Explore: compra o arriendo residencial (servicios, presupuesto, tiempos, entorno).
2. Business: instalación y expansión de negocios (accesibilidad, costos, normativa, competencia, logística).
3. Invest: ingresos, gastos, riesgo, oportunidad, portafolio (Cap Rate, VAN, rentabilidad).
4. Pro: agentes/corredores, operaciones, expedientes, captación, reportes, seguimiento.

## Buyer Journey
Búsqueda / anuncio / recomendación → promesa específica («¿Conviene este local para mi consulta?») → pregunta de actividad y objetivo → dirección/alternativas → cobertura y faltantes → evaluación inicial gratuita → informe ampliado pagado, solo si cuenta con evidencia adecuada → acción siguiente. El valor entregado en gratuito debe ser genuino; no exigir contacto para un cálculo básico.

## Prioridad de verticales
Psicología, odontología, contabilidad y comercio/servicios para probar Business Location. Todas comparten caso/candidatos/criterios, pero tienen preguntas y requisitos obligatorios distintos. Parcelas, compras familiares, herencias, inversionistas y enterprise siguen en roadmap. No perfilar eventos familiares sensibles para prospectar.

## Price ladder – CLP *hipotéticos sin ventas verificadas*
| Escalón | Precio de prueba | Entregable y límite |
|---|---|---|
| Explore | Gratis | Costo básico, cobertura de fuentes, checklist |
| Check | $9.990/caso | Datos con procedencia, alcances acotados |
| Decision Report | $29.990/caso | Economía + territorio + incertidumbre |
| Compare | $69.990 | Hasta 3 alternativas, decisión multicriterio, informe |
| Expert Review | Desde $149.000 | Especialista contratado, revisión delimitada |
| Pro Solo | $49.900/mes | Workspace, cuota de estudios, cuenta profesional |
| Pro Team | $129.900/mes | Equipo, usuarios, reportes, permisos |
| Enterprise | Cotización | API, lotes, SLA y fuentes con derechos |

Prohibido anunciar como disponible lo que no cumple calidad, pruebas, licencias y entrega. Revisar costes de proveedor por cada tier; no regalar cuotas de Places/Routes sin presupuesto.

## Dashboard Business Location, visión objetivo
1. Resumen de decisión: perfil, requisitos duros, lista de locales, próximo paso.
2. Mapa e isócronas (MapLibre con fuentes/límites permitidos), transporte, estacionamientos y equipamientos, según cobertura.
3. Mercado potencial y servicios cercanos; no interpretar negocios POI como censo exhaustivo ni hogares como tránsito real.
4. Economía: arriendo, habilitación, gasto fijo, margen unitario, equilibrio, escenario bajo/base/alto.
5. Factibilidad: permisos y normas, pendientes, bloqueo de actividades declaradas incompatibles.
6. Comparación: restricciones + métricas por local + sensibilidad a pesos del usuario, con incertidumbre.
7. Evidence Center: fuente, fetchedAt, validAsOf, licencia, precisión, escala y versión.
8. Process Graph: acciones de búsqueda, validación, indicadores, simulación, informe; estados genuinos, errores y cancelación.

## UX y diseño
DLS v1 existe; completar DLS v2 con escalas tipográficas, tokens semánticos de proceso, superficies y tema oscuro, componentes reutilizables, Storybook, WCAG 2.2 AA, teclado, estados empty/loading/error/retry, reduced motion, QA visual.
Entrevista adaptativa con máximo una pregunta prioritaria por etapa; permitir saltar dato desconocido sin reemplazarlo por cero.
Separar tres dimensiones: factibilidad obligatoria, comparación económica y confianza/cobertura de datos; no producir puntuación 0–100 opaca.

## Funnel y métrica de valor
Campañas SEO/Search por intención («arriendo local para consulta», «local para clínica dental») + contenidos de punto de equilibrio → evaluación preliminar → informe con evidencia → contratación. Medir inicio de evaluación, finalización, cobertura, tiempo hasta primer hallazgo, CTA, pago, satisfacción, margen por informe y repetición; costos y atribución con consentimiento.

## Arquitectura objetivo
React/TypeScript/Vite; monolito modular con `DecisionCase`, `CandidateLocation`, `Requirement`, `EvidenceFact`, `DerivedIndicator`, `ScenarioRun`, `ReportVersion`, `WorkflowEvent`, `Entitlement`; Supabase RLS multiempresa; API BFF y adaptadores licenciados; PostgreSQL/PostGIS; geo-workers para tareas pesadas; cola, eventos SSE/WebSocket y observabilidad. No desplegar microservicios antes de necesitarlo.

## Roadmap con puertas
- P0: vertical manual verificable + tests + QA; instrumentar adquisición de aprendizaje.
- P1: persistencia segura DecisionCase, validación RLS y grafo de eventos.
- P2: 1–2 conectores geoespaciales nacionales con procedencia, mapa real y cobertura.
- P3: reports y checkout sandbox, validación de precio y margen.
- P4: Buyer / Invest, comparación multicriterio avanzada y Enterprise.

## Definition of Done
Las reglas y cálculos pasan tests, los datos desconocidos permanecen como desconocidos, todo hecho tiene procedencia, móvil y a11y verificados, sin documentos privados expuestos, captura de avance basada en eventos reales; ventas/cobros no activados hasta validación contractual, de costos y datos.
