# Deep Living OS — Cloudflare-first release & low-maintenance operations
Actualizado: 2026-10-27. Plan **realista**, no declaración de producción.

## Aislamiento y estado verificado
- Producto: `products/deep-living-os/` (React/Vite, estático + simulación en navegador). GitHub repo `deepanalytica/deep-analytica-platform`.
- PR #10 rama `feat/deep-living-decision-intelligence` contiene Business Location + Decision Intelligence pero continúa en revisión; pruebas unitarias/SQL/build verdes en CI anterior, no pruebas E2E ni estudio de amenazas/POIs.
- Workflow Cloudflare: `.github/workflows/deep-living-cloudflare-pages.yml`, desplegar **solo** al proyecto `deep-living-os`. `feat/deep-living-decision-intelligence` = preview; `feat/deep-living-os` = candidata a producción después de QA y fusión. No publicar desde main genérico porque aloja otros productos.
- Un workflow de demostración está aislado en `deepanalytica/web2022` y solo puede actualizar `gh-pages/deep-living/os/`, respetando `gh-pages/deep-living/index.html`. **No existe prueba de éxito aún**: inspeccionar rama y URL antes de anunciar.
- Sin confirmación de que existan secrets Cloudflare o proyecto Pages. El workflow intencionalmente omite publicación si faltan; no usar ninguna otra cuenta/proyecto.
- Supabase no debe sustituirse apresuradamente: identidad, RLS y expediente se basan en PostgreSQL. En modo demo la app tiene datos en memoria; falta probar organización, autorización, almacenamiento y política de datos reales.

## Conectar Cloudflare una vez (sin exponer secretos en repositorio)
Método recomendado para mantenimiento mínimo: Pages Git integration en Cloudflare:
1. Cloudflare Dashboard → Workers & Pages → Create Pages → Connect to Git → repo `deepanalytica/deep-analytica-platform`.
2. Nombre del proyecto **`deep-living-os`** (verificar que no pertenezca a otro producto). **Production branch: `feat/deep-living-os`** hasta establecimiento de rama release estable. Otras ramas = previews.
3. Root directory `products/deep-living-os`; Build command `npm install --no-audit --no-fund && npm run check`; Output `dist`; Node 22.
4. Activar automatic deployments y branch previews; restringir a cambios en directorio producto y workflows. Activar Web Analytics, gestionando consentimiento según política.
5. Alternativa GitHub Actions/Wrangler: configurar repositorio Secrets `CLOUDFLARE_API_TOKEN` (permiso Pages Edit solo para cuenta correcta) y `CLOUDFLARE_ACCOUNT_ID`. Workflow ya creado, pero **no mezclar** builds automáticos de Git con Direct Upload sin decidir estrategia. Si el proyecto se creó con Git integration, mantener Git integration como estrategia primaria.
6. URL de preview/producción: solo registrar URLs cuando una implementación real haya respondido satisfactoriamente en HTTPS.

**Variables Supabase:** definir `DL_SUPABASE_URL`, `DL_SUPABASE_ANON_KEY` en GitHub/Cloudflare solo tras confirmar auth, RLS y migraciones en proyecto correcto. ANON key es publicable por definición, pero nunca service_role/secret administrativa. Antes de ello publicar únicamente DEMO, con aviso inequívoco y noindex.

## Arquitectura de coste mínimo — fases y límites
1. **Pages Free**: assets estáticos cacheados en CDN, builds automáticos, previews y rollback. 500 builds/mes; estáticos sin cargo por solicitud. Controlar bundle y performance.
2. **Turnstile Free**: formularios públicos contra spam; validación de token siempre server-side.
3. **Workers Free**: API ligera para validar entradas, token Turnstile, firmar respuestas, autorización y despachar trabajos. Máx. 100.000 solicitudes/día, **10 ms de CPU/request** y 50 subrequests/request; no ejecutar Monte Carlo pesado ni geo raster en Worker.
4. **Supabase (actual)**: usuarios, expedientes privados, membresías, auditoría/RLS. No duplicar datos sensibles en D1 por ahorro aparente. Derechos de acceso verificados por caso.
5. **D1 Free (opcional después)**: catálogo público de fuentes, metadatos y resultados agregados licitamente cacheables, 5 GB y cuotas diarias; jamás duplicación de PII o reglas de acceso de Supabase sin diseño formal.
6. **R2 Free (opcional)**: archivos generados de baja sensibilidad/objetos privados con control server-side, 10 GB estándar; nunca buckets públicos para expedientes.
7. **Queues Free (opcional)**: notificaciones y cálculos diferidos mediante jobs idempotentes; 10.000 operaciones/día y retención 24h, retry con dead-letter, no almacenar datos privados completos en payload.
8. **Web Analytics**: telemetría de tráfico sin PII, eventos de producto internos agregados sujetos a consentimiento e información.

Fuentes oficiales para planes/límites:
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/configuration/monorepos/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/queues/platform/pricing/
- https://developers.cloudflare.com/turnstile/plans/
- https://developers.cloudflare.com/web-analytics/about/

## Flujo cero mantenimiento rutinario
**Commit → CI (33+ unit tests, strict tsc/Vite, SQL/RLS) → preview aislado → smoke navegador/a11y → aprobación de release → despliegue producción → health check HTTP / salud backend → rollback si hay fallo → alertas por anomalía.**
- No hacer deploy de páginas mezclando repositorios y raíces.
- No borrar el dominio actual ni reemplazar sitio corporativo/Deep Mining.
- Mantenimiento basado en excepciones: instrumentar tasa error, cuota Workers, almacenamiento, fallos de Queue, uso por conector; alertas solo para fallo repetido/crítico; audit log sin datos sensibles.
- Coste de terceros geocodificación/POIs/GTFS no está cubierto por Cloudflare Free. Añadir gates de licencia, caché permitida, límites por usuario, presupuesto por ejecución y fallback «sin datos».
- Workers Free devuelve errores al agotar cuota diaria: diseño fail-closed para auth, nunca permitir acceso al contenido privado saltando controles.
- Backups/retención/plan de desastre y reconciliación periódica deben probarse. No es «cero mantenimiento» sino **mínima intervención de rutina**.

## Release gates antes de venta y producción transaccional
- QA 320/390/768/1440 y automatizado E2E/axe, navegabilidad y formularios.
- Verificar Supabase real multi-tenant, RLS, consentimiento y derechos de eliminación/exportación.
- Probadas idempotencia, cambios de estado y reversión de transacciones.
- Datos territoriales realmente licenciados y versionados con fechas/cobertura; no emitir dictámenes no acreditados.
- Términos de producto/contrato, reportes verificables, pagos sandbox y recuperación ante fallos.
- Personal responsable recibe notificación cuando un cálculo o conector falla, no envía conclusiones falsas.

## Paso siguiente operativo
1. Comprobar `https://github.com/deepanalytica/web2022/actions/workflows/deep-living-os-preview.yml`; si ha desplegado, probar `https://deepanalytica.github.io/web2022/deep-living/os/?app=1`. El despliegue público de DEMO no es producción operativa.
2. Comprobar `https://github.com/deepanalytica/deep-analytica-platform/actions/workflows/deep-living-cloudflare-pages.yml`: si falla por proyecto/secrets, conectar Cloudflare primero sin imprimir credenciales.
3. Una vez desplegado, obtener URL real y validar HTTP 200, assets, navegación, consola sin errores.
4. Actualizar `docs/SOFTWARE_STATUS.md`, Notion, SHA y PR; después cerrar gates de backend/cobros para producción funcional.
