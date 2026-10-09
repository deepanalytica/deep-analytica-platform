# Arquitectura técnica, seguridad y operación (ADR-0001)
**Deep Living OS · 2026-10-08 · Estado: propuesta aplicable + componentes iniciales en GitHub**

## Decisión de despliegue
La aplicación queda aislada bajo \`products/deep-living-os/\` en el repositorio preexistente para no modificar la aplicación principal. El workflow compila y verifica la rama; al llegar a main se permite publicar estáticos en Pages, si Pages está habilitado. No se hace merge automático. GitHub Pages **no** hospeda base de datos ni claves privadas. Para producción comercial recomendamos Cloudflare Pages/Workers o equivalente conectado a Supabase/PostgreSQL, usando un pipeline por entorno.

## Diagrama de componentes
\`\`\`mermaid
flowchart TD
  A[Comprador / Corredor / Propietario] --> UI[Web Intelligence + Pro + Mi Operación]
  UI --> AUTH[Supabase Auth]
  UI --> API[API autenticada / RPC]
  API --> RULES[Rules Engine determinista]
  RULES --> DB[(PostgreSQL + PostGIS)]
  RULES --> EVENTS[Audit / append-only events]
  UI --> DATA[Evidence Engine]
  DATA --> CATALOG[Fuentes con licencia revisada]
  CATALOG --> ETL[Python/GeoPandas/Workers]
  ETL --> DB
  DATA --> AI[Asistente con citas a datos autorizados]
  DATA --> HUMAN[Revisión humana según clasificación]
  API --> STORAGE[(Documentos privados)]
\`\`\`

## Dominios y contratos
1. **Identidad/tenancy:** Organizations y Memberships; admin y agent. Participante externo solo puede ver operaciones específicamente asignadas.
2. **Relaciones:** Contacts / clients con acceso limitado. Un contacto no es automáticamente usuario autenticado.
3. **Inventario:** propiedad única por org, estatus declarado y referencia espacial futura, con fuente de adquisición.
4. **Demanda:** lista estructurada de requisitos duros y preferencias; parseo NLP bajo supervisión; matching determinista.
5. **Operaciones:** \`deals\`, \`tasks\`, \`deal_events\`, \`documents\`, \`fees\`. No saltos y bloqueos previos.
6. **Intelligence:** estudio, criterios, evidencias, informes versionados. La revisión experta sólo aparece como «realizada» con responsable e informe.
7. **Colaboración:** solicitudes privadas y acuerdos; alcance federado posterior cuando haya consentimiento explícito.

## Reglas transaccionales
- Entrada \`advance_deal(deal_id, next_stage, summary, visibility)\`.
- Precondiciones: sesión válida; pertenencia al org; secuencia exacta +1; resumen válido; cero tareas bloqueantes pendientes.
- Operación atómica: lock del expediente → comprobación → update stage → insert evento.
- No se permite modificar stage por UPDATE REST de cliente; no se autoriza crear expediente en una etapa arbitraria.
- Fechas, honorarios, condiciones, recepciones y documentos no constituyen verdad legal hasta su revisión y evidencia firmada.
- Concurrencia: serialización de cambios críticos mediante bloqueo de fila; el segundo escritor encuentra stage diferente y falla.

## Amenazas y mitigaciones
| Amenaza | Mitigación |
| --- | --- |
| Tenant A crea tareas sobre operación del tenant B | Trigger validate_dl_scope + claves compuestas, RLS |
| Exposición accidental de documentos privados | Storage privado + ruta org/deal + política de lectura autenticada |
| Portal externo ve notas internas | visibilidad cliente, RLS por deal_participants, no emails públicos |
| Agente salta hasta etapa de entrega | privilegios por columna y avance exclusivo por función |
| Alguien reutiliza enlace de invitación | OTP vinculado a cuenta; otorgamiento explícito de membresía/participación |
| Uso de supabase service_role en frontend | prohibición absoluta; sólo anon/public publishable |
| IA inventa datos | funciones deterministas + evidencia trazable + bloqueo de afirmaciones no sustentadas |
| API Google abusada/costos disparados | quotas, cuotas por plan, cache permitido, observabilidad y alarmas |
| Términos Google/terceros | revisión contractual por fuente, acceso con permiso, nunca scraping restringido |
| Documentos maliciosos | MIME/tamaño, escaneo antivirus futuro, no ejecutar contenido adjunto |

## Privacidad y roles
Acceso mínimo a datos por rol; las observaciones privadas de agentes no se comparten por defecto. El propietario ve honorarios propios, pero no comisiones ocultas de terceros. Un comprador no ve automáticamente el informe independiente de otro. Historial de acceso a documentos, consentimiento y expiración de accesos son requisitos previos a GA.

## QA
CI: npm test, tsc --noEmit, vite build. Antes de comercializar: suites E2E con dos organizations, dos agentes, dos participantes, intentos de escalamiento; probar rutas de storage, CORS, rate limits, sesiones expiradas, manejo de simultaneidad y auditoría.
**RLS tests recomendados:** usuario org A no lee, edita ni crea documentos, tarifas o tareas sobre org B; propietario A sólo ve tarea cliente de su negocio; comprador no ve fees; agente no salta etapas; no puede subir archivos al prefijo de otro org.

## Observabilidad
Métricas de tasa de error por funcionalidad, latencia p95, intentos RLS fallidos, costo API/informe, fallos por proveedor, tareas vencidas. Retención configurable, redacción PII en logs. Backups cifrados y ensayo de restauración; no basta confiar en proveedor sin prueba.

## Reglas de conectores
Todos pasan por interfaz \`SourceAdapter\`: licencia, geoCoverage, citation, fetchedAt, validAsOf, resolution, confidence, terms, transformationVersion. Sólo observaciones verificables se convierten en Fact. Si falla un proveedor, el campo queda «desconocido», nunca cero. Google Places no se convierte en corpus propio permanente.

## Infraestructura futura
- Supabase PostgreSQL/PostGIS para núcleo, índices GIST.
- Python batch y parquet para datos oficiales grandes, GitHub Actions sólo para CI y despliegue controlado.
- Cloudflare Workers para API/colas livianas; jobs geoespaciales pesados separados.
- No auto-merge de migraciones ni cambios de política RLS en producción.
- Registro legal versionado y revisión humana de reglas antes de usarlo en decisiones.

## Estado real
La demo permite recorrer funcionalidades y realizar cambios locales no persistentes. El modo conectado usa RLS con Supabase y necesita aprovisionamiento/QA. No existen conexiones en vivo a INE, Google, CBR, DGA, MINSAL ni pasarela de pago. Los productos completos de inteligencia territorial necesitan ETL por fuente, contrato/licencia, pruebas y revisión antes de venta.
