export type TrustState = "verified" | "conditional" | "blocked" | "pending";

export interface EvidenceItem {
  id: string;
  title: string;
  source: string;
  updated: string;
  state: TrustState;
  note: string;
}

export interface Scenario {
  id: string;
  label: string;
  subtitle: string;
  capital: string;
  horizon: string;
  value: string;
  returnMetric: string;
  reversibility: string;
  water: string;
  uncertainty: string;
  summary: string;
}

export const experienceData = {
  project: {
    name: "Los Andes · Demo",
    subtitle: "Cu-Au · Chile · operación + expansión",
    capital: "US$ 150 M",
    horizon: "2026–2031",
    trust: 68,
    trustLabel: "Condicional",
    nextAction: "Resolver restricción hídrica",
  },
  evidence: [
    { id: "EV-01", title: "Serie de producción 2018–2026", source: "Operación", updated: "2 meses", state: "verified", note: "Cobertura mensual completa." },
    { id: "EV-02", title: "Imágenes satelitales Sentinel-2", source: "Copernicus", updated: "12 días", state: "verified", note: "Usadas para cambio superficial y contexto." },
    { id: "EV-03", title: "Modelo geológico 3D", source: "Consultor técnico", updated: "6 meses", state: "conditional", note: "Requiere actualización con campaña reciente." },
    { id: "EV-04", title: "Disponibilidad hídrica de cuenca", source: "Dataset público + operación", updated: "3 meses", state: "conditional", note: "Incertidumbre material para expansión." },
    { id: "EV-05", title: "Precio de cobre LME", source: "Mercado", updated: "1 día", state: "verified", note: "Entrada exógena, no garantía de precio futuro." },
    { id: "EV-06", title: "Riesgo geotécnico", source: "Campaña histórica", updated: "8 meses", state: "blocked", note: "Cobertura insuficiente para el nuevo footprint." },
  ] satisfies EvidenceItem[],
  scenarios: [
    { id: "A", label: "Expandir operación", subtitle: "Fase 4", capital: "US$ 150 M", horizon: "5 años", value: "US$ 320 M", returnMetric: "19% TIR", reversibility: "Baja", water: "Alta", uncertainty: "Media", summary: "Aumenta capacidad usando infraestructura existente; depende de cerrar agua y geotecnia." },
    { id: "B", label: "Validar Target Norte", subtitle: "Campaña exploratoria", capital: "US$ 25 M", horizon: "3 años", value: "US$ 220 M*", returnMetric: "28% escenario", reversibility: "Alta", water: "Baja", uncertainty: "Alta", summary: "Compra información antes de comprometer CAPEX mayor. *Valor de escenario, no recurso declarado." },
    { id: "C", label: "Mantener liquidez", subtitle: "Esperar mejores condiciones", capital: "US$ 0", horizon: "12–24 meses", value: "—", returnMetric: "—", reversibility: "Máxima", water: "N/A", uncertainty: "Baja", summary: "Conserva opcionalidad hasta recibir nueva evidencia técnica y de mercado." },
  ] satisfies Scenario[],
  architecture: [
    ["Deep Geo", "Realidad espacial: terreno, capas, infraestructura, riesgo y cambio."],
    ["Praxios OS", "Orquesta contexto → evidencia → escenarios → decisión → seguimiento."],
    ["Meta-Harness", "Impide que inferencias, forecasts o claims públicos crucen gates sin soporte."],
    ["Rust Core", "Motor canónico de reglas, evaluación y auditoría reproducible."],
  ],
  tests: [
    ["MH-EVID-001", "Fact sin evidencia", "definido"],
    ["MH-PUB-001", "Claim público sin sign-off", "definido"],
    ["MH-FC-003", "Forecast no supera baseline", "definido"],
    ["MH-KEY-001", "Decisión high-impact sin humano", "definido"],
    ["Property tests", "Invariantes de transición epistemológica", "pendiente CI"],
    ["Mutation tests", "Capacidad de los tests para detectar reglas rotas", "pendiente CI"],
  ],
};
