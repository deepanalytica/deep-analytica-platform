# Test Driven Development — matriz de calidad / Deep Living OS

## Entornos
- **CI demo:** sin credenciales, todas las pantallas presentan datos ficticios etiquetados; no se almacena información de clientes.
- **QA aislado:** Supabase proyecto exclusivo; migraciones en orden, datos de prueba, identidades separadas y permisos RLS.
- **Preproducción:** despliegue no indexado, backend aislado y datos sintéticos.
- **Producción:** sólo tras gates de seguridad, privacidad, licencias y cobro.

## Pruebas unitarias (implementadas)
| ID | Caso | Resultado esperado |
| --- | --- | --- |
| U-01 | 2% de 100 millones + IVA 19% | 2.380.000 CLP |
| U-02 | Demanda «Curicó, 3 dormitorios, estacionamiento» | Filtros extraídos y revisables |
| U-03 | Propiedad fuera del presupuesto | No pasa requisitos duros |
| U-04 | Saltar etapa 4 a 6 | Prohibido |
| U-05 | Tarea bloqueante pendiente | No avanza |
| U-06 | Tarea vencida | Alerta prioritaria |
| U-07 | Sin datos geográficos | Mostrar «desconocido», no «seguro» |
| U-08 | Reclamo verificado sin fuente | Bloquear publicación |
| U-09 | Dato de inventario | «Declarado», no «validado externamente» |

## Pruebas integradas (OBLIGATORIAS antes de uso real)
| ID | Preparación | Paso | Debe comprobarse |
| --- | --- | --- | --- |
| S-01 | Organización A y B; usuarios A1/B1 | A1 consulta propiedades B | Acceso denegado |
| S-02 | A1 conoce UUID deal B | Insert task con org A y deal B | Bloqueo trigger |
| S-03 | A1 conoce UUID propiedad B | Crear deal A con property B | Bloqueo trigger |
| S-04 | Usuario externo propietario A y comprador A | Consultar fee del deal | Propietario ve sólo lo suyo, comprador no |
| S-05 | Propietario A participante | Consultar tarea interna | Nunca visible |
| S-06 | Agent A | Insert deal con stage 8 | Denegado por privilegios |
| S-07 | Agent A | Llamar advance_deal 4→6 | Rechazado |
| S-08 | Agent A | Llamar advance_deal con tarea bloqueante | Rechazado |
| S-09 | Admin A | Asignar usuario externo A al deal | Visible solo ese deal |
| S-10 | Agent A | Asignar participante | Rechazado si no es admin |
| S-11 | Agent A | Subir archivo a org B | Bucket bloquea |
| S-12 | Cliente | Acceder a archivo privado de corredor | No hay token válido |
| S-13 | Actor sin autenticación | Consultar deals y docs | Cero filas |
| S-14 | Cliente A | Intentar mutar etapa o comisión vía REST | Bloqueado |
| S-15 | Agente A | Completar tarea dos veces simultáneamente | Estado coherente |
| S-16 | Agente A y A2 | Avanzar a la vez la misma etapa | Un cambio válido y evento único |
| S-17 | QA | Borrar/redactar registros bajo solicitud legal | Política aprobada y evidencia de ejecución |

## E2E funcional
1. Registro propietario: admin debe asignar identidad autenticada con consentimiento; usuario entra al portal correcto.
2. Agente crea propiedad, demanda y búsqueda: lista se actualiza sin recargar.
3. Agente crea deal y tarea bloqueante: intento de avance falla.
4. Agente marca tarea hecha: siguiente avance se acepta y queda evento único.
5. Cliente abre enlace: ve ocho etapas, su tarea publicada y ninguna nota interna.
6. Honorarios: monto, IVA y milestone aparecen para propietario, conforme al acuerdo real; jamás afirmar que simulación equivale a contrato.
7. Carga documental: MIME/tamaño inválido falla; archivo no tiene URL pública.
8. PreCheck: no inventa indicadores de seguridad ni flujo y declara ausencia de datos.
9. Intelligence: cambio de presupuesto recalcula elegibilidad, no predice rentabilidad.
10. Sin datos: estados vacíos adecuados, no contenido ficticio sin rotular.

## Pruebas de UX y accesibilidad
- Mobile 360px, 390px, tablet 768px, desktop 1440px.
- Sin scroll horizontal salvo tablas explícitamente desplazables.
- Tabulación de controles, Escape en diálogos, foco devuelto al elemento disparador (pendiente).
- Contraste WCAG AA, lectores de pantalla, notificaciones aria-live, descripciones.
- Prueba de usuarios: propietario debe responder «¿en qué etapa estoy, qué falta, quién lo hace y cuándo debo pagar?» sin ayuda.
- Prueba de corredores: completar una oportunidad desde consulta hasta oferta sin planilla paralela.

## Gates comerciales
No comercializar informes «verificados» antes de tener: una conexión a dataset autorizado, pruebas de cobertura y precisión, política de fuente y correcciones, método de revisión y facturación funcional.
No procesar datos reales de clientes antes de tener: entorno aislado, pruebas S-01...S-17, respaldo, restauración, retención y soporte de incidentes.
