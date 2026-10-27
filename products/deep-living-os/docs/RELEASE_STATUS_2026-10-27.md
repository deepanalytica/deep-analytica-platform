# Deep Living — Informe de publicación y límites · 2026-10-27

## Entregado (verificado a través de GitHub)
- App React Business Location + Decision Intelligence con 33 pruebas y compilación anteriores aprobadas en PR #10, fuente `deepanalytica/deep-analytica-platform`. Los cambios de esta iteración en rama `feat/deep-living-decision-intelligence` agregaron pipeline Cloudflare y documentación operativa.
- **Demostración pública aislada** insertada en `deepanalytica/web2022`, rama `gh-pages`, archivo `deep-living/os/index.html`, commit `c6f729be43d3f0420c0fe3405120e01f421c0bb7`; metadatos `deep-living/os/release.json`, commit `83af4c388b220f395afea54f7c10ae05a55a01b1`.
- GitHub fetch confirmó HTML de 660.136 caracteres, contenido «Ubicación para negocios», marca `noindex,nofollow` y preservación de la landing existente `deep-living/index.html` sin sobrescribirla.
- **Ruta prevista:** https://deepanalytica.github.io/web2022/deep-living/os/ (Pro vía `?app=1`). **No hay prueba HTTP externa satisfactoria de publicación:** navegador web del entorno no consiguió acceder; verificar GitHub Pages status, HTTPS, JS y carga real antes de compartir como sitio público funcional. No se confirma DNS/cache ni URL Cloudflare.
- El HTML es `Deep_Living_OS_v2_Demo_Standalone.html` de la versión validada anterior: **solo demo sin Supabase**, operaciones y evaluación simuladas, **sin datos territoriales reales, sin informes pagados**, uso comercial condicionado.

## Cloudflare Pages
- Se agregó `.github/workflows/deep-living-cloudflare-pages.yml`, vinculado solo al proyecto `deep-living-os`; prueba TS/build y publica preview desde `feat/deep-living-decision-intelligence` y producción solo desde rama base `feat/deep-living-os` cuando `DL_PRODUCTION_ENABLED=true`.
- Faltan confirmación de proyecto Cloudflare, token `CLOUDFLARE_API_TOKEN`, ID `CLOUDFLARE_ACCOUNT_ID` y backend real autorizado. Sin ellos el workflow no despliega; modo demo por defecto.
- No se modificó Cloudflare/DNS, no se borró ni modificó Deep Mining, no se cambió el Pages del monorepo principal.
- Documentación de límites, costes y escalado: `docs/CLOUDFLARE_OPERATIONS.md`.

## Próximas verificaciones P0 para producción
1. Verificar deployment de GitHub Pages de `web2022`, respuesta 200 y experiencia móvil/desktop con un navegador real; solucionar HTML/caché si falla.
2. Conectar proyecto separado `deep-living-os` a Cloudflare Pages vía Git Integration (recomendado) con raíz `products/deep-living-os`, salida `dist`, o configurar secrets Actions, nunca ambos pipelines sin necesidad.
3. Smoke/E2E teclado, responsive, errores del navegador, performance, seguridad.
4. Configurar Supabase real y pruebas de segregación RLS con cuentas de dos organizaciones; solo entonces habilitar operaciones.
5. Conectores de datos chilenos y cobertura, validación de uso de suelo, permisos, transporte y competencia; admitir "sin datos".
6. Entrega versionada y pagos sandbox antes de pagos productivos.
7. Monitorizar cuotas Workers, latencias y estado de backend; rollback si un gate falla. Actualizar Notion y este documento con SHA y URL verificados.

## Regla de veracidad
- «Commiteado» ≠ «CI aprobado» ≠ «publicado en GitHub Pages» ≠ «servicio HTTPS probado» ≠ «producción operacional».
- La fecha, rama, URL, pruebas y disponibilidad deben registrarse por separado.
