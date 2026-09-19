import { Project, PraxiosRun } from "./ontology";
import { evaluateProjectGate } from "./metaHarness";

export function runDecisionWorkflow(project: Project, decisionId: string): PraxiosRun {
  const decision = project.decisions.find((item) => item.id === decisionId);
  if (!decision) throw new Error("Decision not found");

  const gate = evaluateProjectGate(project, decision);
  const hasForecast = decision.forecastIds.length > 0;

  return {
    id: `run-${decision.id}`,
    projectId: project.id,
    decisionId: decision.id,
    gate,
    steps: [
      { id: "context", label: "Contexto del activo", status: "done" },
      { id: "evidence", label: "Evidencia y procedencia", status: decision.evidenceIds.length ? "done" : "blocked" },
      { id: "claims", label: "Afirmaciones e incertidumbre", status: decision.claimIds.length ? "done" : "blocked" },
      { id: "forecast", label: "Series y forecast", status: hasForecast ? "done" : "pending" },
      { id: "alternatives", label: "Comparación de alternativas", status: decision.options.length >= 2 ? "done" : "blocked" },
      { id: "harness", label: "Meta-Harness", status: gate.status === "pass" ? "done" : "blocked" },
      { id: "human", label: "Decisión humana", status: decision.humanDecision ? "done" : "pending" },
    ],
  };
}
