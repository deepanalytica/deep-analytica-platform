# Deep Living — PRD integral (v1.0)
**Estado:** especificación de producto aprobable; desarrollo incremental en rama de GitHub.  
**Fecha:** 2026-10-08 · **Región inicial:** Maule, Chile · **Idiomas:** español chileno.  
**Propietario de producto:** Deep Living / Deep Analytica · **Audiencia:** producto, ingeniería, operaciones, legal, datos, ventas, diseño.  
**Veracidad:** toda capacidad se clasifica como implementada, prototipo, integrada, en validación o prevista. Ninguna afirmación de disponibilidad de una API sustituye pruebas y revisión de licencia.

## 1. Visión y tesis comercial
Deep Living ayuda a evaluar con mejores antecedentes las decisiones inmobiliarias y a conducir operaciones con responsabilidades claras, documentos, información verificable y seguimiento compartido. Se divide en dos productos comerciales con motor común:
- **Deep Living Intelligence (B2C/B2B transaccional):** evaluación por inmueble o sector, comparación de alternativas, costos, conveniencia y prechequeos; monetización por informe.
- **Deep Living Pro (SaaS B2B):** centro de anticipación, prospectos, inventario, demandas, matching, red de corredores bajo consentimiento, expediente, honorarios, tareas y etapas transaccionales.
- **Mi Operación:** portal limitado para propietario/comprador participante; forma parte de Pro, no se comercializa aisladamente.
- **Evidence Engine:** catálogo de fuentes, capturas autorizadas, procedencia, vigencia, geometría, reglas, verificaciones y observaciones humanas. No es un producto autónomo.

**Principio no negociable:** resolver decisiones inmobiliarias de forma transparente; no garantizar rentabilidades, ausencia de delitos o amenazas, idoneidad jurídica ni resultados comerciales. La IA no altera estados o evidencia por su cuenta.

## 2. Problema, oportunidad y alcance
### 2.1 Trabajos por realizar (JTBD)
| Persona | Situación | Resultado deseado | Alternativa actual | Solución inicial | Métrica |
| --- | --- | --- | --- | --- | --- |
| Profesional que busca oficina | Tiene 2-3 opciones, presupuesto y actividad definida | Comparar conveniencia y costo total | Portales, Maps, visitas y conocidos | Compare + informe | Conversión a compra, utilidad |
| Emprendedor/local | Compromete arriendo y habilitación | Evitar ubicación comercialmente incompatible | Visitas informales | Location Fit | Alternativas examinadas con evidencia |
| Comprador de parcela | Considera reservar/comprar | Detectar antecedentes por verificar | Preguntas al vendedor y mapas sueltos | Parcel PreCheck | Hallazgos corroborados |
| Comprador familiar | Debe elegir vivienda | Comparar desplazamientos, servicios y costos | Avisos dispersos | Home Compare | Decisiones informadas |
| Corredor independiente | Varias captaciones y ofertas | Priorizar acciones, evitar omisiones y cobrar | Excel, WhatsApp, carpetas | Command+Verify+Operations | Uso semanal y tiempo por expediente |
| Oficina inmobiliaria | Equipo y cartera | Trazabilidad y responsabilidad | CRM fragmentado | Pro multiusuario | Retención, operaciones activas |
| Corredor colaborador | Tiene demanda sin inventario | Acordar canjes claros sin perder cliente | Grupos de WhatsApp | Network | Coincidencias verificadas |
| Propietario vendedor | No sabe cómo avanza | Estado, próximo paso, plazos y comisiones acordadas | Llamadas | Mi Operación | Comprensión de estado y consultas repetidas |
| Abogado/técnico | Necesita antecedentes ordenados | Revisar caso específico y emitir dictamen | Correo/carpetas | Portal de revisión limitado | Tiempo de revisión |

### 2.2 Resultados de negocio
1. Validar ventas pagadas de informes antes de automatizar exhaustivamente fuentes externas.
2. Lograr que corredores completen operaciones reales con trazabilidad y sin planilla paralela.
3. Medir margen por informe, adquisición, retención, calidad de datos, incidencias y tasa de corrección.
4. No convertir «confianza» en un número arbitrario: publicar cobertura y salvedades.

### 2.3 No objetivos del primer lanzamiento
No construir CRM universal, bolsa inmobiliaria pública ni agregador de anuncios sin licencia; no raspado de Google/portales; no tasación legal/crediticia automatizada; no certificación de seguridad o saneamiento jurídico; no pagos/escrow sin proveedor autorizado; no actuaciones notariales; no dictámenes hidráulicos/geotécnicos no supervisados; no predicción de delitos por persona o domicilio.

## 3. Arquitectura de experiencias y journeys
### 3.1 Comprador/inteligencia
Descubre problema → declara actividad/objetivos/presupuesto → introduce direcciones o alternativas → confirma geocodificación → ve cobertura de fuentes disponible antes de pagar → selecciona alcance y precio → obtiene análisis con fuentes y límites → compara alternativas → recibe entregable versionado → decide y solicita acompañamiento opcional. Si la cobertura es insuficiente: aviso antes del cobro y elección de alternativa o reembolso según condiciones.

### 3.2 Corredor/pro
Se autentica → entra a Command → registra cliente y demanda → registra/autoriza propiedad → prechequeo con responsabilidades → agenda y visitas → oferta → revisión previa a promesa → promesa → escritura → inscripción/pagos → entrega → expediente auditado. Cada evento tiene actor, tiempo, resumen, evidencia y visibilidad. En etapas críticas se exige aprobación humana y se prohíbe salto de estado.

### 3.3 Propietario/Mi Operación
Acceso privado con usuario individual → consulta resumen de etapa entre 1 y 8, explicación sencilla, próximos pasos, tareas propias, comunicación y comisiones pactadas cuando corresponda → confirma decisiones por mecanismo de aceptación explícita diseñado y auditado; no se confunde «lo leyó» con «aceptó». El corredor conserva campos internos confidenciales.

### 3.4 Colaboración
Corredor A tiene demanda → solicita colaboración a otro corredor B → B otorga autorización explícita para un subconjunto de inventario/datos → ambas partes definen representación, comisión y reglas de contacto → se registra aceptación → visita/oferta y cierre. No hay cartera federada pública ni exposición automática de datos personales.

## 4. Módulos funcionales, historias y criterios de aceptación
### 4.1 Command
- DL-CMD-01: mostrar cartera, demandas sin resolución, bloqueos, vencimientos y posibles comisiones desde datos reales; no usar números ficticios sin etiqueta.
- DL-CMD-02: priorizar por reglas transparentes: vencido > bloqueo > acción futura; usuario puede abrir expediente y resolver.
- DL-CMD-03: estados y KPI deben recalcularse luego de cada evento relevante.
**Aceptación:** tarea vencida aparece prioritaria; sin tareas no inventa alertas; acceso multiempresa aislado.

### 4.2 CRM y propiedades
- DL-INV-01: CRUD limitado a organización; fichas separan datos públicos, privados y evidencia.
- DL-INV-02: captación incluye consentimiento/autorización comercial y responsable.
- DL-CRM-01: contacto y demanda con presupuesto, comuna, tipo, estacionamiento y dormitorios; campos no confirmados se marcan pendientes.
**Aceptación:** ninguna búsqueda expone datos de otra organización; presupuesto 0 o negativo rechazado cuando se exige capacidad adquisitiva.

### 4.3 Match / Prospect
- DL-MAT-01: interpretar petición en español y convertir a filtros revisables; nunca asumir aprobaciones financieras.
- DL-MAT-02: condiciones duras (precio, operación, tipo, dormitorios, localidad) excluyen alternativas incompatibles; preferencias afectan ranking.
- DL-MAT-03: indicar número de coincidencias *confirmadas disponibles* y solicitudes sin cobertura; datos externos no confirmados muestran estado distinto.
- DL-MAT-04: guardar demanda no satisfecha como señal privada de captación.
**Aceptación:** una propiedad fuera de presupuesto no aparece aunque su ranking contextual sea alto.

### 4.4 Verify y operaciones
- DL-OPS-01: 8 etapas: acuerdo, preparación, comercialización, oferta, promesa, escritura, inscripción/pagos, entrega.
- DL-OPS-02: impedir saltos de etapas e impedir avances con tareas bloqueantes.
- DL-OPS-03: registrar evento auditado atómicamente con cambio de estado.
- DL-OPS-04: documentos con fuente, tipo, fecha, verificación, revisión responsable y accesos.
- DL-OPS-05: matriz comercial de comisión pactada, impuestos según caso, hito de exigibilidad, incumplimientos y aceptación.
- DL-OPS-06: las reglas jurídicas tienen fuente, fecha de vigencia, versión, alcance y aprobación humana; una lista no equivale a estudio de títulos.
**Aceptación:** bloqueos no pueden eludirse editando directamente la columna stage desde la interfaz; el cliente nunca ve notas internas.

### 4.5 Location / Intelligence
- DL-LOC-01: comparar inmuebles según actividad y criterios definidos por cliente; separar obligatorios de preferencias.
- DL-LOC-02: puntajes solo sobre criterios medidos con procedencia; sin evidencia, el indicador queda «sin datos», NO cero.
- DL-LOC-03: matriz de fuentes con cobertura geográfica, fecha, licencia, resolución y calidad.
- DL-LOC-04: advertir cuando un indicador indirecto (población residente, número de paraderos) NO corresponde al indicador solicitado (flujo peatonal, frecuencia real).
- DL-LOC-05: informes reproducibles con versión de fuentes, recomendaciones condicionadas y disenso/corrección.
- DL-LOC-06: referencias cartográficas nunca certifican seguridad predial, rentabilidad ni licencias comerciales.
**Aceptación:** ejemplo sin datos reales no presenta cifras de delitos, flujos o amenazas inventadas.

### 4.6 Network
- DL-NET-01: solicitud privada de colaboración con estado y participante; no mostrar clientes ni inventario a otros sin autorización expresa.
- DL-NET-02: registro de acuerdos previos de canje y comisiones; fase inicial manual.
**Aceptación:** participante no autorizado no obtiene lista ni contacto de terceros.

### 4.7 Portal de cliente y pagos
- DL-TRK-01: contraseña/enlace individual, no contraseñas compartidas, 8 estados visuales y próximos pasos.
- DL-TRK-02: acceso exclusivamente a operación con participación explícita; vista cliente no revela notas internas ni otras operaciones.
- DL-PAY-01: comisiones visibles solo a parte obligada y corredor, conforme al contrato; fecha y condiciones pactadas, sin inferir vencimiento legal.
- DL-PAY-02: venta de informes requiere proveedor de pago habilitado y entrega idempotente; no se habilitan cobros hasta que los flujos y términos estén validados.

## 5. Catastro y gobierno de datos
| Familia | Fuentes candidatas | Uso | Riesgo/limitación |
| --- | --- | --- | --- |
| Población | INE Censo 2024, cartografía censal | Caracterización de zonas | Manzana no es flujo horario |
| Actividad comercial | SII estadísticas, patentes municipales si accesibles | Estructura empresarial | Cobertura/privacidad/licencia |
| Servicios | MINSAL, MINEDUC, OSM, Overture | Proximidad y accesibilidad | Deduplicación y vigencia |
| Google | Places, Routes, Geocoding | Consultas puntuales autorizadas | Pago, almacenamiento, atribución |
| Seguridad | CEAD agregados | Contexto y cautelas | No clasificar seguridad individual |
| Transporte | MTT/GTFS donde exista, GeoMOP | Acceso y rutas | Diferencias territoriales |
| Territorio | MINVU/DOM/CIP, GeoMOP, SEA | Normativa, obras y restricciones | El predio concreto puede requerir certificado |
| Amenazas | SENAPRED, DGA, SERNAGEOMIN, CIREN | Hallazgos preliminares | Escala, cobertura, revisión experta |
| Satélites | Copernicus, productos licenciados | Contexto histórico y cambios | Metodología/cómputo/comercialidad |
| Propiedades | Cartera propia, feeds contractuales, avisos autorizados | Matching | No copiar portales sin licencia |
| Mercado | SII/MINVU, datos publicados y proveedores | Comparables y costos | Sesgos, retrasos |
| Finanzas | Banco Central UF, valores aportados | Escenarios y honorarios | No preaprobación hipotecaria |

**Gates de conector:** existencia y permisos → contrato/licencia → pruebas cobertura Curicó/Talca → esquema → normalización → versión → monitoreo → publicación. Ningún conector se declara «en producción» sin pasar las siete puertas.
**Catálogo físico futuro:** datasets, source_versions, observations, facts, geometries, evidence_links, licenses, derived_indicators, model_versions, audit_logs. No guardar contenido de Google más allá de los usos que permitan sus políticas.
**Privacidad y ética:** no inferir riesgo crediticio, delictual o comportamiento personal a partir de datos del barrio; impedir usos discriminatorios de atributos protegidos.

## 6. Reglas y Evidence Engine
- Nivel de afirmación: `observado`, `estimado`, `pendiente`, `no_sustentado`.
- Calidad requiere: fuente, fecha del dato, actualización, escala, cobertura, autorización, algoritmo y revisión.
- IA solo produce explicaciones sobre paquetes de evidencia; no genera hechos ni modifica estados críticos por mensajes en lenguaje natural.
- Funciones deterministas gestionan cálculo de comisiones, filtros duros, transiciones y vencimientos.
- **Fail closed:** si falta un dato excluyente, pasar a REVIEW, no suponer PASS.
- Documentos de riesgos naturales o jurídicos requieren aprobación humana competente cuando se solicita conclusión técnica.
- Revisión de evidencia: solicitudes con identidad, alegación, respaldo, resolución y versiones; no permitir edición silenciosa de informes emitidos.

## 7. Modelo de datos
Entidades mínimas: organizations, memberships, contacts, properties, demands, deals, deal_participants, tasks, deal_events, documents, fees, exchange_requests, location_studies; evolución: data_sources, claims, observations, reports, report_versions, report_access, consent_events, review_assignments, payment_intents, invoices, ledgers.
La propiedad y la operación son objetos distintos: una propiedad puede tener múltiples compradores/ofertas, cada una con expediente independiente.
Multiempresa RLS obligatoria; permisos explícitos para participantes externos y acceso temporal de especialistas.
Eventos de la operación: actor, acción, versión, timestamps inmutables, referencias de evidencia y visibilidad.

## 8. Diseño y accesibilidad
- Identidad: azul tinta, marfil claro, grises sobrios, acento turquesa; sin degradados innecesarios.
- Escritorio: navegación lateral persistente, Command primero y bandeja de alertas basada en datos.
- Móvil: navegación compacta, tareas priorizadas, controles táctiles de 44px, tablas adaptativas.
- B2C: guiar con preguntas sencillas, mostrar primero qué se puede comprobar, claridad sobre cobertura y costo antes de pagar.
- Portal cliente: seguimiento tipo encomienda, no dashboard denso; acciones «qué falta / quién / hasta cuándo / qué documento».
- Accesibilidad: WCAG 2.2 AA objetivo, etiquetas, navegación por teclado, estados accesibles, contraste, estados vacíos y errores claros.
- Idioma: español de Chile; términos legales acompañados de explicaciones.
- Nunca presentar registros demo como datos reales.

## 9. Seguridad, operaciones y calidad
**Autenticación:** OTP/magic link y proveedores seguros cuando se implementen; recuperación y controles contra abuso. **Autorización:** RLS, aislamiento por organización, verificación de referencias cruzadas, roles internos y participantes. **Storage:** bucket privado, límites de tipos/tamaños, URLs firmadas solo tras autorización. **Auditoría:** eventos append-only y cambios sensibles registrables; alertas de accesos anómalos. **Infraestructura:** TLS, secretos solo servidor, copias de seguridad, restauración probada, retención y eliminación legal.
**No funcionales objetivo** (no garantizados hasta medición): LCP <2.5s en equipos de gama media, interacción principal <200ms en red normal, disponibilidad objetivo 99.9%, RPO <24h/RTO <8h según contrato de proveedor y pruebas, sin exposición cruzada de organizaciones (cero tolerancia).
**QA:** unit tests de filtros, comisiones, estado, RLS automatizadas en instancia temporal, E2E auth/admin/cliente, pruebas de amenazas multiempresa, regresión visual escritorio/móvil, accesibilidad y carga. Aprobación obligatoria antes de permitir clientes reales.
**GitHub Actions:** quality gate en PR (tests+typecheck+build); despliegue condicionado a main, credenciales y Pages/hosting; no publicar secretos ni ejecutar migraciones de producción sin aprobaciones.

## 10. Negocio y finanzas
**Hipótesis de precios B2C:** Esencial CLP 9.990; Compara 24.990; Decisión 49.900. Alcance y revisiones diferenciados; costos profesionales externos presupuestados aparte.
**Hipótesis B2B:** independiente 29.900–49.900/mes; oficina pequeña desde 79.900/mes; validación mediante pilotos, no anclar sin disposición a pagar.
**Economía unitaria:** ingreso neto por orden − pasarela − consultas API − infraestructura marginal − trabajo humano − soporte − reembolsos − CAC amortizado. Definir presupuesto de consultas por informe y límite por fuente.
**Embudo:** consulta/diagnóstico gratuito limitado → cobertura y propuesta de valor → informe pagado → decisión → servicio inmobiliario opcional. Se declara si Deep Living representa propiedades comercializadas.
**Distribución:** SEO de problemas («¿me conviene este local?»), alianzas con corredores y profesionales, contenidos educativos, estudios locales, referidos. No utilizar tácticas que desacrediten a corredores ni informes sesgados en favor del inventario propio.

## 11. KPIs y analítica
- North Star B2C: decisiones asistidas verificables con utilidad reportada y evidencia suficiente.
- North Star Pro: operaciones reales activas con etapas, próximos pasos y bloqueos correctamente gestionados.
- Activación B2C: finalización diagnóstico, tasa de cobertura, checkout, entrega válida, satisfacción, tasa de correcciones.
- Activación Pro: tiempo hasta primera propiedad, primera demanda, primer seguimiento enviado, primera operación cerrada; WAU por oficina, churn, soporte.
- Seguridad/calidad: consultas con fuente verificable, errores de geocodificación, accesos denegados, incidentes, falso positivo/negativo de alertas.
- Costos: costo por informe, costos de Google, costo de revisión, margen bruto, CAC, LTV estimado después de cohortes.

## 12. Plan de desarrollo y gates
**F0 Fundaciones**: PRD y arquitectura, design system, CI, RLS, experiencia demo honestamente rotulada.
**F1 Pro núcleo**: Auth, inventario, demanda, matching, operaciones, tareas, portal autorizado, comisiones y documento privado.
**F2 Intelligence piloto**: informe de conveniencia desde inputs conocidos + cobertura y procedencia, comparación real Curicó/Talca, versión de informe.
**F3 Conectores**: INE, MINSAL, OSM y normativa solo después de permisos, ETL y pruebas de cobertura.
**F4 Comercial**: pasarela pagos, consentimientos, facturación, límites, soporte y SLA.
**F5 Escala**: canjes autorizados, fuentes premium, análisis de riesgos supervisado, Atlas por microzona.

**Gates de salida para clientes reales:**
G1 CI verde y pruebas RLS/E2E; G2 políticas de privacidad, términos, revisión legal y seguridad; G3 fuentes/licencias verificadas; G4 facturación y pagos reales end-to-end; G5 observabilidad, backups y proceso de incidentes; G6 pilotos pagados y margen medido.

## 13. Riesgos principales y mitigaciones
1. Informe con dato errado: fuentes, versiones, revisión y corrección.
2. Fracasa negocio ajeno por informe: lenguaje neutral, evidencia, alcance, derecho a revisión de datos, transparencia sobre conflictos.
3. Filtración de documentos: RLS, bucket privado, pruebas y mínimo acceso.
4. Costos elevados por API: presupuesto y rate-limit, batch y cache solo cuando legal.
5. Invadir condiciones de Google o portales: catálogo contractual, no scraping prohibido.
6. Conclusiones geotécnicas o legales automáticas: prohibidas sin revisión.
7. Red canjes sin participación: piloto y acuerdos, no build masivo.
8. Falta de demanda pagada: vender manualmente diez informes y medir costo real.
9. Sesgo territorial: no puntuar personas ni atribuir delincuencia a residentes.
10. Cobertura irregular: declarar zonas soportadas y ofrecer alternativa, no inventar.

## 14. RACI ejecutivo
| Decisión | Responsable | Autoridad de aprobación | Consultados |
| --- | --- | --- | --- |
| Estrategia y capital | CEO | CEO | CFO/CPO |
| Roadmap y aceptación | CPO | CEO | CTO, clientes piloto |
| Arquitectura y seguridad | CTO | CTO | Legal, Data Lead |
| Evidencia territorial | Data Lead | Responsable técnico | Fuentes, especialistas |
| Tarifas y márgenes | CFO | CEO | CPO/CMO |
| Promesas comerciales | CMO | CPO/Legal | CEO |
| Reglas jurídicas | Especialista jurídico | Responsable legal | CTO/Operaciones |
| Estudios geotécnicos | Especialista acreditado | Responsable técnico | Data Lead |
| Cambios de etapas | Agente autorizado | Regla + revisión humana | Partes según contrato |

## 15. Definición de listo (DoD)
Una funcionalidad termina solo cuando tiene: historia y criterio, pruebas de casos borde, aislamiento de datos, errores y estados vacíos, instrumentación sin PII innecesaria, UX móvil, accesibilidad básica, documentación, pipeline verde, aprobación del responsable y evidencia de funcionamiento. Un dashboard que solo muestra datos inventados es una demo y **no** una función operacional terminada.

## 16. Estado de implementación a fecha de PRD
Se están desarrollando pantallas y funciones en la rama `feat/deep-living-os` del repositorio `deepanalytica/deep-analytica-platform`. Ya existen esquema inicial Supabase, reglas de negocio, demostraciones rotuladas y workflow CI. El conjunto completo de 73 fuentes requiere integraciones por separado y validación de sus licencias. La publicación comercial no debe declararse completada sin prueba de producción y de seguridad.
