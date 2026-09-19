export type EpistemicLevel =
  | "fact"
  | "inference"
  | "hypothesis"
  | "forecast"
  | "scenario"
  | "recommendation";

export type Confidence = "low" | "moderate" | "high";
export type GateStatus = "pass" | "hold" | "fail";
export type DecisionStatus = "draft" | "ready" | "approved" | "rejected";

export interface Source {
  id: string;
  title: string;
  kind: "document" | "dataset" | "map" | "sensor" | "market" | "human";
  uri?: string;
  authority?: string;
  observedAt?: string;
  verified: boolean;
}

export interface Evidence {
  id: string;
  sourceId: string;
  title: string;
  excerpt?: string;
  observedAt?: string;
  quality: number;
  verified: boolean;
}

export interface Claim {
  id: string;
  statement: string;
  level: EpistemicLevel;
  evidenceIds: string[];
  supports?: string[];
  contradicts?: string[];
  confidence: Confidence;
  uncertainty: string[];
  publicClaim?: boolean;
  competentSignoff?: boolean;
}

export interface Forecast {
  id: string;
  metric: string;
  model: string;
  horizon: string;
  sourceSeries: string[];
  covariates: string[];
  backtestMetric: string;
  backtestScore: number;
  baselineScore: number;
  lower: number;
  point: number;
  upper: number;
  unit: string;
  validatedAt: string;
}

export interface Risk {
  id: string;
  title: string;
  category: "technical" | "legal" | "environmental" | "market" | "operational" | "financial";
  severity: "low" | "medium" | "high" | "critical";
  evidenceIds: string[];
  mitigation: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  capital: number;
  currency: string;
  reversible: boolean;
  rationale: string;
}

export interface Decision {
  id: string;
  title: string;
  question: string;
  impact: "low" | "medium" | "high";
  status: DecisionStatus;
  options: DecisionOption[];
  evidenceIds: string[];
  claimIds: string[];
  forecastIds: string[];
  riskIds: string[];
  uncertainties: string[];
  proposedOptionId?: string;
  humanDecision?: {
    optionId: string;
    actor: string;
    decidedAt: string;
    rationale?: string;
  };
}

export interface Project {
  id: string;
  name: string;
  region: string;
  commodity: string;
  stage: string;
  gate: string;
  demo: boolean;
  capitalAvailable: number;
  currency: string;
  sources: Source[];
  evidence: Evidence[];
  claims: Claim[];
  forecasts: Forecast[];
  risks: Risk[];
  decisions: Decision[];
}

export interface HarnessFinding {
  rule: string;
  severity: "blocker" | "warning";
  message: string;
  entityId?: string;
}

export interface GateEvaluation {
  status: GateStatus;
  score: number;
  blockers: HarnessFinding[];
  warnings: HarnessFinding[];
  checkedAt: string;
}

export interface PraxiosRun {
  id: string;
  projectId: string;
  decisionId: string;
  steps: Array<{
    id: string;
    label: string;
    status: "done" | "blocked" | "pending";
  }>;
  gate: GateEvaluation;
}
