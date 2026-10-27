# Deep Living — Decision Intelligence (ADR-DI-001)

Versión: laboratorio v0.1. Estado: prototipo de simulación hipotética, **no calibrado** y **no apto para recomendaciones financieras automáticas**.

## Integración

El módulo reside en la aplicación existente en products/deep-living-os, NO en un repositorio separado:
- src/App.tsx: menú INTELIGENCIA > Decision Intelligence. Disponible en Deep Living Pro y no en el portal de participantes.
- src/DecisionIntelligence.tsx: interfaz React integrada, controles, indicadores, árbol, exportación local.
- src/decision-engine.ts: motor TypeScript puro determinista con semilla y métodos de Monte Carlo.
- src/decision-intelligence.css: interfaz responsiva acorde a los tokens de diseño ya existentes.
- tests/decision-engine.test.ts: invariantes y controles.

Usa el inventario existente como opción, pero únicamente propiedades en venta con precio positivo. La selección sólo **precarga un valor declarado**; no convierte anuncios en tasaciones. Para propiedades de arriendo se impide interpretar renta como precio de adquisición. No hay persistencia, servicios externos, modificaciones de Supabase ni descarga de información personal; los escenarios se guardan opcionalmente como JSON en el equipo del usuario. No se modifican Deep Mining, operaciones, RLS ni otros módulos.

## Escenarios (14)

Referencia, inmueble heredado, nido vacío, traslado de ciudad, liquidez urgente, demanda alta de arriendos, mercado débil, infraestructura nueva, inundación/aluvión, incendio, terremoto, seguridad barrial, costos de mantención elevados y título pendiente.

Cada escenario modifica **hipótesis**, no son mediciones por dirección. La clasificación abarca familia, sucesión, finanzas, territorio, amenazas y mercado.

## Alternativas (7)

Vender ahora; arrendar y vender al final; mantener sin arriendo y vender al final; remodelar y vender; remodelar, arrendar y vender al final; mitigar, arrendar y vender al final; esperar hasta dos años y vender.

Todas las acciones muestran valor presente estimado; valor medio, P10, mediana, P90 y CVaR10, con iteraciones reproducibles. Se usa valor de liquidación neto al final del horizonte para comparar distintas alternativas. Las rutas se simulan de manera independiente; no hay correlaciones modeladas entre variables de riesgo, por lo que no deben inferirse probabilidades reales del mercado. No incorpora impuestos sobre ganancias, hipotecas, una segunda vivienda, valor emocional ni costes de mudanza.

## Salvaguardas

- Sin facultades jurídicas declaradas: no vender ni arrendar; orientar a revisión.
- Habitabilidad no declarada: no arrendar; requerir evaluación técnica.
- Liquidez urgente: descartar alternativas que solo entregan capital en el futuro.
- La información introducida es una declaración, no verificación externa.
- Daños naturales/seguros se manejan con supuestos de laboratorio, nunca con una amenaza real calculada por dirección.
- No perfilar herederos, personas en duelo o familias a partir de fuentes públicas para contactarles.
- Ante peligro real prevalecen autoridades y evaluaciones técnicas por sobre la simulación.

## Uso

Desde products/deep-living-os ejecutar npm install, npm run check y npm run dev. En modo demo abrir /?app=1 y entrar a INTELIGENCIA > Decision Intelligence. Elegir propiedad o caso manual, modificar parámetros y escenarios, revisar bloqueos, árboles y distribución de resultados. Exportación JSON local.

## Futuras fases (no implementadas)

1. Evidencia: casos privados con RLS, fuente, vigencia, calidad y aprobación humana.
2. Integración Deep Geo: consultas por geometría y capas oficiales con procedencia, NUNCA riesgo no verificado.
3. Calibración: compraventas efectivas, vacancia observada, validación retrospectiva por zona, tipo, periodo y sensibilidad.
4. Evaluación integral: dos viviendas, crédito hipotecario, impuestos, posesión efectiva, tiempos, valoración explícita del bienestar, multiobjetivo.
5. Generación de embudos: a partir de necesidades voluntariamente manifestadas y consentimiento, con trazabilidad y restricciones de captación.

## Criterios de aceptación

- El menú y la vista se integran sin alterar la navegación existente.
- Misma semilla y parámetros producen el mismo resultado.
- Parámetros fuera de rango no se silencian.
- Bloqueos jurídico, habitabilidad y liquidez funcionan.
- Sensibilidad a precio del arriendo.
- Exportación de métricas sin muestras detalladas y sin datos personales.
- Pruebas de reglas y compilación con npm run check.
- QA visual, validación financiera, revisión legal y pruebas E2E antes de comercializar.
