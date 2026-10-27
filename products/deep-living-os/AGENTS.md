# Deep Living OS — instrucciones de continuidad del agente
Última revisión documental: 2026-10-27. **Leer antes de modificar código.**

## Objetivo de producto
Plataforma nacional chilena que resuelve decisiones inmobiliarias de compra, arriendo profesional/comercial, inversión y gestión de corredores con evidencia trazable. El caso inicial de validación comercial es **arrendar un local/oficina para una actividad específica**, NO limitar a Curicó/Talca.

## Fuente de verdad
- Implementación: `products/deep-living-os/` en `deepanalytica/deep-analytica-platform`.
- Rama activa: `feat/deep-living-decision-intelligence`; PR #10 apunta a `feat/deep-living-os`.
- Revisión general: `docs/SOFTWARE_STATUS.md`. Visión y monetización: `docs/PRODUCT_STRATEGY_V2.md`.
- Continuidad de ingeniería: `docs/NEXT_AGENT.md`. Sistema de diseño: `src/tokens.css`, `docs/DESIGN_SYSTEM.md`.
- Notion: https://app.notion.com/p/406c569163ac810e908be444c16bb4cd

## Protocolo de reanudación (obligatorio)
1. Verificar HEAD, PR, nuevos commits, conflictos y CI. No asumir que la documentación refleja el último estado.
2. Leer `src/BusinessLocation.tsx`, `src/location-fit-engine.ts`, tests y `App.tsx` antes de extenderlos. Ejecutar `npm install --no-audit --no-fund && npm run check`.
3. Auditar UI con capturas, accesibilidad, móvil, modo demo, estados errores, y fuente de cada indicador. Corregir sin inventar tiempos ni métricas.
4. Hacer cambios pequeños, probar, hacer commits descriptivos, verificar CI y actualizar `docs/SOFTWARE_STATUS.md`, Notion y este registro.
5. Registrar HEAD, evidencia de tests, estado del despliegue, obstáculos y tres próximas acciones en el último cierre.

## Restricciones no negociables
- Indicadores de tránsito, estacionamiento, demanda, delito, georriesgo, usos permitidos y plusvalía solo con fuente, permiso, vigencia y alcance claros. `unavailable` ≠ 0; `declared` ≠ `verified`.
- El nuevo Business Location calcula solo datos declarados, **sin** consulta externa ni autorización de permisos. Nunca calificar como “local apto” por los puntajes financieros.
- Cambios transaccionales requieren backend autorizado y RLS. No introducir `service_role` en web.
- El avance visual de procesos debe derivarse de ejecución genuina; no porcentajes ficticios, animaciones de trabajo simulado ni confirmaciones antes de persistir.
- No comercializar informes avanzados ni habilitar pagos hasta cerrar calidad, privacidad, entrega y reembolsos.
- Mantener independencia de otros proyectos en el monorepo. No usar n8n.

## Próximo bloque recomendado
1. QA visual + mejoras test/UX de Business Location y CI verde.
2. Diseño de entidad persistente `DecisionCase` y CRUD protegido por RLS, antes de conectar datos sensibles.
3. Primer conector geoespacial nacional con procedencia y cobertura; después mapa y comparador territorial.
4. Integración transversal de `WorkflowEvent` con grafo real y cancelación.
5. Instrumentación de funnel y checkout sandbox, nunca producción sin validación.

## Comandos
```sh
cd products/deep-living-os
npm install --no-audit --no-fund
npm run check
npm run dev
```
Abrir `/?app=1`, menú INTELIGENCIA → Ubicación para negocios. Sin Supabase: DEMO sin persistencia.
