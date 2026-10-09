# Catálogo priorizado de fuentes y estrategia de conectores
**Estado:** evaluación documental. No equivale a licencia aprobada ni integración verificada en producción.

## Prioridades y fuentes
| Prioridad | Categoría | Fuente / acceso | Valor | Regla de uso |
|---|---|---|---|---|
| P0 | Estadística | INE Censo 2024 https://censo2024.ine.gob.cl/resultados/ | Población, hogares, viviendas, manzanas | Citar fecha y unidad geográfica |
| P0 | Cartografía | INE geodatos https://www.ine.gob.cl/herramientas/portal-de-mapas/geodatos-abiertos | Geometrías y unidades | Revisar sistema de coordenadas |
| P0 | Mapas | OSM https://www.openstreetmap.org/copyright | Vías y establecimientos | ODbL, atribución y obligaciones derivadas |
| P0 | Lugares | Overture https://docs.overturemaps.org/guides/places/ | POI en GeoParquet | Licencias por origen, deduplicación |
| P0 | Salud | MINSAL IDE https://www.minsal.cl/ide-minsal-geoportal-descarga-de-datos/ | Establecimientos | Normalizar vigencia |
| P0 | Economía | SII estadísticas https://www.sii.cl/sobre_el_sii/estadisticas_de_empresas.html | Rubros/empresas | Agregados, no inferir ingresos individuales |
| P0 | Tasas | Banco Central API BDE https://si3.bcentral.cl/estadisticas/Principal1/Web_Services/index_API_sec1_es.htm | UF / series | Credenciales/uso y fecha de referencia |
| P1 | Vialidad | GeoMOP https://geomop.mop.gob.cl/descargas/ | Vías, obras y capas | Cobertura y licencias de descarga |
| P1 | Planificación | MINVU IPT https://www.minvu.gob.cl/elementos-tecnicos/planes-reguladores-2023/portal-de-instrumentos-de-planificacion-territorial/ | Zonificación/planes | Certificados DOM cuando corresponda |
| P1 | Educación | MINEDUC/Agencia https://www.agenciaeducacion.cl/ | Colegios y contexto | No inferir calidad escolar de un solo indicador |
| P1 | Transporte | MTT / GTFS cuando exista https://www.mtt.gob.cl/ | Paraderos y horarios | Confirmar cobertura fuera de Santiago |
| P1 | Seguridad | CEAD https://cead.spd.gov.cl/ | Estadísticas agregadas | No etiquetar barrios «peligrosos» |
| P1 | Google | Places https://developers.google.com/maps/documentation/places/web-service/overview | Consulta puntual POI | Condiciones de retención, mapas y cobro |
| P1 | Google | Routes https://developers.google.com/maps/documentation/routes/overview | Distancias y duraciones | Tiempo de viaje ≠ tráfico real medido |
| P1 | Proyectos | SEA https://sig.sea.gob.cl/mapadeproyectos/ | Impacto territorial | Proyecto sometido a evaluación ≠ ejecución |
| P1 | Licitaciones | ChileCompra API https://www.chilecompra.cl/api/ | Obras y actividad pública | No confundir adjudicación con obra terminada |
| P2 | Hidrología | DGA https://dga.mop.gob.cl/sistema-hidrometrico-en-linea/ | Caudales/precipitación | Estaciones ≠ predio |
| P2 | Amenazas | SENAPRED https://senapred.cl/mapas-de-amenaza/ | Peligros regionales | Escala y metodología obligatorias |
| P2 | Geología | SERNAGEOMIN https://portalgeomin.sernageomin.cl/ | Remociones/geología | Revisión por especialista |
| P2 | Suelos | CIREN https://www.ciren.cl/productos/suelos/ | Drenaje/aptitud | Verificar productos y licencias |
| P2 | Satélite | Copernicus Data Space https://dataspace.copernicus.eu/analyse/apis | Sentinel STAC/OData/openEO | Resolución/metodología/comercialidad |
| P2 | Conservador | CBR competente / ChileAtiende | Títulos, gravámenes | Sin API nacional abierta confirmada |
| P2 | SII inmueble | SII https://www.sii.cl/ | Roles/avaluaciones | Consulta sólo por vía autorizada |
| P2 | SUBTEL | Registro conectividad https://rnc.subtel.gob.cl/ | Cobertura referencial | No garantiza servicio |
| P2 | Agua rural | MOP / Servicios sanitarios rurales | Redes/proyectos | Acceso y factibilidad en terreno |
| P2 | Mercado inmob. | MINVU observatorio suelo | Valores de suelo | Comparables no necesariamente tasaciones |
| P3 | Patentes | Municipios | Actividades autorizadas | Consentimiento/licencias y calidad |
| P3 | Flujo real | Aforos propios / proveedores de movilidad | Actividad por franja | Muestreo, cobertura, privacidad y costo |
| P3 | Inventory | APIs / feed inmobiliario contractual | Ofertas | Propiedad intelectual, permiso del titular |
| P3 | Bancario | Entidades y convenios | Financiamiento | Sin supuesta preaprobación |

## Data Contract mínimo
\`\`\`ts
type DataContract = {
 sourceId: string;
 termsVersion: string;
 license: string;
 commercialUseReviewed: boolean;
 geographicCoverage: string[];
 temporalCoverage: string;
 retrievedAt: string;
 observedAt?: string;
 crs?: string;
 resolution?: string;
 qualityFlags: string[];
 attribution: string;
 allowedStorage: "none"|"id_only"|"metadata_only"|"permitted";
}
\`\`\`
**Procesamiento:** solo conectores autorizados. El cuerpo de datos protegido no entra al repositorio. Cada snapshot con hash, fecha, versión y catálogo de transformaciones. Datos «no disponibles» permanecen nulos.

## Evaluación de productos por data readiness
- Office/Local Compare P0: inventario autorizado + geocodificación + OSM + INE + MINSAL; sin flujos horarios reales.
- Parcel PreCheck P1/P2: fuentes oficiales, revisión de escala y responsable geotécnico; no certificar.
- Pro Verify: documentos aportados por usuario, checklists y expediente; referencias jurídicas versionadas.
- Mobility by hour: P3, no ofrecer como medición real hasta obtener licencias/aforos.
- Market valuation: P2, requiere transacciones representativas y metodología.
- Payments: proveedor de pagos autorizado e idempotencia, no activado por código actual.

## Fórmula de decisión y cobertura
Una métrica sólo entra al informe cuando consta \`validity=verified\` y la resolución es suficiente para el caso. No ponderar métricas faltantes como cero; mostrar cobertura por criterio. Requisitos obligatorios se validan antes de ranking; falta de dato de exclusión = revisión pendiente.

## Siguiente investigación técnica
1. Descargar INE Censo y comparar una manzana de Curicó/Talca con cartografía.
2. Levantar POIs Overture/OSM, estudiar sesgos por barrio y duplicados.
3. Calcular distancias sobre red y documentar si son en línea recta o de viaje.
4. Pedir acceso a patentes municipales y verificar condiciones.
5. Probar una solicitud oficial GTFS fuera de RM.
6. Consultar licencias y documentación API de empresas proveedoras.
7. Medir costos reales por informe y definir restricciones de venta.
