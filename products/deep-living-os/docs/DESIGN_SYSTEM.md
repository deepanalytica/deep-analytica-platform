# Deep Living Design System · DLS v1.0
**Alcance:** tres experiencias (Intelligence público, Pro corredor y Mi Operación propietario) y un lenguaje visual compartido.

## Principios
1. **La claridad gana:** menos tarjetas, más decisiones. El estado real y el siguiente paso son más importantes que una estadística decorativa.
2. **Evidencia visible:** observado/estimado/pendiente se representan con texto e iconos, nunca solo por color.
3. **Sin veredictos falsos:** ninguna interfaz afirma «propiedad segura» o «rentabilidad garantizada».
4. **Interacción reversible donde sea posible:** acciones irreversibles exigen revisión, evidencia y confirmación; jamás avances silenciosos por IA.
5. **Separación de audiencias:** consumidor recibe preguntas sencillas, agente recibe prioridades, propietario recibe seguimiento tipo envío.

## Tokens implementados
Los tokens están en `src/tokens.css`, con prefijo `--dl-*`. Uso semántico, no variables `--blue-500` que no expresan intención.

| Rol | Token | Hex |
| --- | --- | --- |
| Marca / acción principal Pro | --dl-color-primary | #315DCD |
| Acento Intelligence | --dl-color-forest | #16866F |
| Titulares | --dl-color-ink | #132C46 |
| Texto secundario | --dl-color-muted | #718397 |
| Superficie | --dl-color-panel | #FFFFFF |
| Fondo app | --dl-color-canvas | #F5F7FA |
| Bordes | --dl-color-outline | #E2E9F0 |
| Advertencia | --dl-color-warning | #98651C |
| Error | --dl-color-error | #B54744 |
| Éxito | --dl-color-success | #16866F |

Tipografía: **Manrope** 700/800 para títulos; **DM Sans** 400/500/600/700 para contenido y acciones; fallbacks sistema.
Escala recomendada:
- Hero público: clamp(36, 4.4vw, 65px)
- Página: clamp(27, 3vw, 35px)
- Sección: 24–36px
- Tarjeta: 15–20px
- Cuerpo: 13–16px con line-height 1.55–1.7
- Metadatos: 11–12px, nunca reducir información legal importante a 9px.

Espaciado: 4px; componentes con ritmo 8 / 12 / 16 / 24 / 32. Radios 6 / 9 / 13 / 18px. Área táctil objetivo 44px.

## Arquitectura visual
**Intelligence**: fondo claro marfil/blanco, verde bosque como acción principal, geometrías/mapa esquemático, tono consultivo. Hero expresa el costo de decidir a ciegas. CTA «Explorar mi evaluación», no prometer informe completo sin datos. Secciones: problema → selector necesidad → evaluación guiada → método → planes → confianza → Pro.
**Pro**: sidebar azul tinta, área de trabajo clara, acciones azules, métricas derivadas de datos, tablas, fichas, tareas y expedientes. La pantalla de entrada debe contestar: qué requiere atención y cuánto falta.
**Mi Operación**: progreso 1–8 tipo tracking; fecha, responsable, tarea, documentos, comisión pactada. Mantener vocabulario no técnico y resumen de cada hito.

## Componentes y estados
- Botones: principal, secundario, terciario y deshabilitado; foco visible, sin acciones falsas.
- Estado de evidencia: Verificado, Declarado, Estimado, Pendiente, No sustentado; etiqueta y explicación.
- Estado de operación: 8 etapas, cada una con completo/actual/futuro.
- Alertas: vencido/bloqueo/seguimiento, con título + próxima acción + origen.
- Tablas: scroll horizontal solo cuando sea necesario, encabezados claros.
- Formulario: etiqueta persistente, validación, error contextual, confirmación de guardar.
- Estados vacíos: describir qué falta y cómo registrar el primer dato.
- Demo: advertencia persistente, nunca mezclar datos ficticios y reales sin distinción.
- Historial: orden cronológico, actor y evidencia cuando esté disponible.
- Accesibilidad: WCAG 2.2 AA objetivo; navegación teclado, textos alternativos, semántica y anuncios de actualización.

## QA visual
320, 360, 390, 768, 1024, 1440, 1920px; capturas de regresión y revisión humana antes de aprobar. Lighthouse y axe pendientes. Los estilos actuales son MVP y aún requieren pruebas visuales E2E.

## Componentización siguiente
Migrar gradualmente los elementos `Metric`, `Pill`, `StageBar`, `Box`, `Field` a `src/ui/`; compartir tokens y patrones entre dos productos sin imponer la misma composición de pantalla.
