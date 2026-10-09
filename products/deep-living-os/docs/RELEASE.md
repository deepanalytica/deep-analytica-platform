# Deep Living OS · Release Runbook v0.2
**Situación actual:** código y tests en rama `feat/deep-living-os`; sitio público aún no publicado. No promover operación con usuarios reales hasta completar RLS, privacidad y configuración de backend.

## Opción A · Publicar landing informativa en GitHub Pages sin Cloudflare
1. Verificar en GitHub que el repositorio privado pueda publicar Pages en el plan de su cuenta.
2. Entrar a **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Revisar PR #8 y sus tests, y solo entonces fusionar en `main`.
4. El workflow `.github/workflows/deep-living-os.yml` construye `products/deep-living-os`, publica como Pages y muestra URL de despliegue en GitHub Actions. Este mecanismo no toca el Worker de Deep Mining.
5. Comprobar HTTPS, título, redirecciones, referencias de iconos y URLs, móvil, accesibilidad y funcionamiento. Hasta configurar backend, Pro se presenta como DEMO.

**Nota:** no se ha confirmado que Pages esté habilitado para este repositorio, y la publicación no debe presentarse como realizada sin comprobar HTTP en la URL resultante.

## Opción B · Publicar en Cloudflare Pages vía GitHub Actions
1. Crear token de API Cloudflare con permisos mínimos para **Pages:Edit** sobre la cuenta elegida.
2. En **GitHub repo → Settings → Secrets and variables → Actions → Repository secrets**, crear:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. Ejecutar la workflow **Deep Living · Cloudflare Pages** o publicar un commit en la rama elegida. El flujo crea un proyecto Pages independiente llamado `deep-living-intelligence-deepanalytica` si no existe.
4. El resultado esperado es `https://deep-living-intelligence-deepanalytica.pages.dev` u otra URL comunicada por Cloudflare si el nombre no está disponible.
5. Exigir que el paso **Verify published site** haga GET HTTPS y encuentre el título correcto; si falla, revisar logs. La URL es una expectativa, no una prueba de disponibilidad.
6. Para dominio propio, asociarlo mediante Cloudflare DNS después de verificar el primer despliegue.

**Bloqueo comprobado (2026-10-08):** falta al menos una de las dos credenciales en GitHub Actions; el despliegue registra error explícito. No almacenar tokens en el repositorio ni enviarlos por chat.

## Base de datos y acceso real
1. Crear y administrar un proyecto Supabase o conectar la integración de Supabase a ChatGPT para realizar la configuración con autorización.
2. Configurar Auth/OTP, URL de retorno, protección antiabuso y correo transaccional.
3. Aplicar en orden **las cinco migraciones**:
```
20261008_init.sql
20261008_hardening.sql
20261008_fee_privacy.sql
20261008_onboarding.sql
20261008_fees_draft.sql
```
4. Establecer variables **públicas** `DL_SUPABASE_URL` y `DL_SUPABASE_ANON_KEY` en GitHub Actions Variables (Vite los incorpora al frontend). No usar service_role.
5. Ejecutar pruebas integradas en un Supabase real: control de acceso por tenant, roles comprador/propietario, bucket de documentos, caducidad sesiones y conflicto de comisiones.
6. Validar procedimiento de almacenamiento/eliminación, privacidad y autorización de documentos. Las propuestas de comisión no son acuerdos firmados.

## Comercializar informes
**No habilitar pagos** hasta que existan conectores autorizados, calidad comprobada de datos, términos y límites adecuados, proceso de incidencias/reembolsos, pasarela y documentación tributaria conforme a las exigencias chilenas.

## Rollback y continuidad
- Frontend: Cloudflare Pages y GitHub Pages mantienen deployments versionados; restaurar versión anterior desde panel si corresponde.
- Base de datos: migraciones con revisión previa, copias cifradas, pruebas de restauración y despliegue independiente; no revertir con borrados sobre datos productivos.
- Incidente: desactivar acceso si hay exposición de datos; bloquear nuevas altas, preservar evidencias y notificar según normativa vigente.
