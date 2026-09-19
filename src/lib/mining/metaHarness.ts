import {
  Claim,
  Decision,
  Evidence,
  Forecast,
  GateEvaluation,
  HarnessFinding,
  Project,
} from "./ontology";

const now = () => new Date().toISOString();

function evidenceMap(evidence: Evidence[]) {
  return new Map(evidence.map((item) => [item.id, item]));
}

function validateClaim(claim: Claim, evidence: Evidence[]): HarnessFinding[] {
  const findings: HarnessFinding[] = [];
  const byId = evidenceMap(evidence);
  const linked = claim.evidenceIds.map((id) => byId.get(id)).filter(Boolean) as Evidence[];

  if (claim.level === "fact" && linked.length === 0) {
    findings.push({
      rule: "MH-EVID-001",
      severity: "blocker",
      entityId: claim.id,
      message: "Un hecho no puede existir sin evidencia enlazada.",
    });
  }

  if (["fact", "inference", "hypothesis", "recommendation"].includes(claim.level) &&
      linked.some((item) => !item.verified)) {
    findings.push({
      rule: "MH-EVID-002",
      severity: claim.level === "fact" ? "blocker" : "warning",
      entityId: claim.id,
      message: "La afirmación depende de evidencia aún no verificada.",
    });
  }

  if (claim.level !== "fact" && claim.uncertainty.length === 0) {
    findings.push({
      rule: "MH-UNC-001",
      severity: "warning",
      entityId: claim.id,
      message: "Toda inferencia, hipótesis o recomendación debe explicitar incertidumbre.",
    });
  }

  if (claim.publicClaim && !claim.competentSignoff) {
    findings.push({
      rule: "MH-PUB-001",
      severity: "blocker",
      entityId: claim.id,
      message: "Una afirmación técnica marcada para publicación requiere aprobación técnica competente.",
    });
  }

  return findings;
}

function validateForecast(forecast: Forecast): HarnessFinding[] {
  const findings: HarnessFinding[] = [];

  if (forecast.sourceSeries.length === 0) {
    findings.push({
      rule: "MH-FC-001",
      severity: "blocker",
      entityId: forecast.id,
      message: "Forecast sin series fuente.",
    });
  }

  if (!(forecast.lower <= forecast.point && forecast.point <= forecast.upper)) {
    findings.push({
      rule: "MH-FC-002",
      severity: "blocker",
      entityId: forecast.id,
      message: "El intervalo predictivo es inconsistente.",
    });
  }

  if (forecast.backtestScore >= forecast.baselineScore) {
    findings.push({
      rule: "MH-FC-003",
      severity: "warning",
      entityId: forecast.id,
      message: "El modelo no supera al baseline en backtesting; no debe ganar peso decisional.",
    });
  }

  return findings;
}

function validateDecision(decision: Decision): HarnessFinding[] {
  const findings: HarnessFinding[] = [];

  if (decision.options.length < 2) {
    findings.push({
      rule: "MH-DEC-001",
      severity: "blocker",
      entityId: decision.id,
      message: "Una decisión necesita al menos dos alternativas explícitas.",
    });
  }

  if (decision.uncertainties.length === 0) {
    findings.push({
      rule: "MH-DEC-002",
      severity: "blocker",
      entityId: decision.id,
      message: "La decisión debe declarar incertidumbres materiales.",
    });
  }

  if (decision.impact === "high" && !decision.humanDecision) {
    findings.push({
      rule: "MH-KEY-001",
      severity: "blocker",
      entityId: decision.id,
      message: "Decisión de alto impacto: la llave final pertenece a una persona.",
    });
  }

  return findings;
}

export function evaluateProjectGate(project: Project, decision: Decision): GateEvaluation {
  const findings: HarnessFinding[] = [
    ...project.claims.flatMap((claim) => validateClaim(claim, project.evidence)),
    ...project.forecasts
      .filter((forecast) => decision.forecastIds.includes(forecast.id))
      .flatMap(validateForecast),
    ...validateDecision(decision),
  ];

  const linkedEvidence = new Set(decision.evidenceIds);
  if (linkedEvidence.size === 0) {
    findings.push({
      rule: "MH-DEC-003",
      severity: "blocker",
      entityId: decision.id,
      message: "La decisión no puede avanzar sin evidencia directamente enlazada.",
    });
  }

  const blockers = findings.filter((f) => f.severity === "blocker");
  const warnings = findings.filter((f) => f.severity === "warning");
  const rawScore = 100 - blockers.length * 30 - warnings.length * 8;

  return {
    status: blockers.length ? "hold" : "pass",
    score: Math.max(0, rawScore),
    blockers,
    warnings,
    checkedAt: now(),
  };
}
