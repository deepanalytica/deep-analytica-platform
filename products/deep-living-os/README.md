# Deep Living OS

Sistema independiente de inteligencia y operaciones inmobiliarias para Chile, mantenido en `products/deep-living-os/`. No modifica la aplicación raíz del repositorio.

## Módulos

Command (alertas, tareas, anticipación), Match (necesidades y coincidencias), Inventario/Prospect, Operations (8 etapas y auditoría), Verify (lista de comprobación jurídica), Track (portal de participantes), Network (registro de solicitudes de canje), Location (evaluación de ubicaciones manual y transparente), Finance (comisiones).

## Instalación

1. `cd products/deep-living-os && npm install && npm run check && npm run dev`.
2. Crear proyecto Supabase; ejecutar `supabase/migrations/20261008_init.sql`; habilitar autenticación por enlace de correo y definir URLs de redirección.
3. Crear organización y membresía, utilizando el UUID de `auth.users` después de autenticar:
   `insert into public.organizations(name) values ('Mi corredora') returning id;`
   `insert into public.memberships(org_id,user_id,role) values ('ORG_UUID','AUTH_USER_UUID','admin');`
4. En GitHub Settings > Secrets and variables > Actions > Variables definir `DL_SUPABASE_URL` y `DL_SUPABASE_ANON_KEY`. Nunca usar una service role key en el frontend. Localmente utilizar `.env` basado en `.env.example`.
5. Settings > Pages: Source GitHub Actions. Al fusionar en main, el workflow publica el sitio en Pages si el plan y la configuración de este repositorio privado lo permiten.

## Seguridad y restricciones

Sin configuración de Supabase se muestra una DEMOSTRACIÓN con datos ficticios. No almacenar información personal allí. Con Supabase, el proyecto utiliza RLS multiempresa, membresías, participantes de operación, eventos y almacenamiento privado. El avance transaccional se efectúa exclusivamente por RPC verificada. Se requieren pruebas RLS/E2E, políticas de privacidad, backups y revisión de cumplimiento antes de operar con clientes reales. Track no expone expedientes internos. Location no fabrica estadísticas territoriales; solo criterios aportados.

No están implementadas integraciones con Conservadores, bancos, portales inmobiliarios, firma avanzada, WhatsApp o fuentes cartográficas externas; la red de canjes es manual hasta obtener convenios y consentimientos. La lista jurídica no sustituye un estudio de títulos ni una revisión profesional.

## CI/CD

`npm run check` ejecuta tests de reglas y compilación. GitHub Actions realiza build en push/PR del proyecto; deploy solo desde main. GitHub Pages sirve frontend estático; Supabase provee backend y autenticación.
