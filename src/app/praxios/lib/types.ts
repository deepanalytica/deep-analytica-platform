export type EpistemicClass =
  | "OBSERVED"
  | "PUBLISHED"
  | "DERIVED"
  | "INFERRED"
  | "HYPOTHESIS"
  | "COUNTERFACTUAL"
  | "UNKNOWN";

export type GateStatus = "PASS" | "REVIEW" | "BLOCK";
export type SessionPhase =
  | "OBSERVE"
  | "REASON"
  | "PROPOSE"
  | "VERIFY"
  | "AUTHORIZE"
  | "EXECUTE";

export type Evidence = {
  id: string;
  kind: string;
  summary: string;
  source: { title?: string; uri?: string } | null;
  peerReviewed: boolean;
  uncertainty: string | null;
  capturedAt: string | null;
  metadata: Record<string, unknown>;
};

export type GateResult = {
  id: string;
  status: GateStatus;
  reason: string;
};

export type ReviewRecord = {
  verifierId: string;
  verifierModel?: unknown;
  summary?: string;
  uncertainty?: string | null;
  contradictions?: unknown[];
  timestamp?: string;
};

export type Claim = {
  id: string;
  text: string;
  epistemic: EpistemicClass;
  evidenceIds: string[];
  method: string | null;
  confidence?: number | null;
  uncertainty: string | null;
  identifiability: "I0" | "I1" | "I2" | "I3";
  requiredIdentifiability?: "I0" | "I1" | "I2" | "I3" | null;
  contradictions: Array<Record<string, unknown>>;
  requestedUse: string;
  proposerId: string;
  verifierId: string | null;
  proposerModel?: unknown;
  verifierModel?: unknown;
  status: string;
  verdict: GateStatus | null;
  gates: GateResult[];
  reviews: ReviewRecord[];
  requireIndependentReview: boolean;
};

export type Task = {
  id: string;
  title?: string;
  role?: string;
  provider?: string;
  model?: string;
  status?: string;
  dependsOn?: string[];
  output?: unknown;
  [key: string]: unknown;
};

export type Authorization = {
  id: string;
  actionId: string;
  action?: Action;
  status: "PENDING" | "APPROVED" | "DENIED" | string;
  consumed?: boolean;
  requestedBy?: string;
  approvedBy?: string | null;
  reason?: string;
  [key: string]: unknown;
};

export type Action = {
  id: string;
  title?: string;
  executor: string;
  payload?: unknown;
  effect?: string;
  tags?: string[];
  requiredClaimIds?: string[];
  claimThreshold?: GateStatus;
  status?: string;
  [key: string]: unknown;
};

export type DecisionOption = {
  id: string;
  label: string;
  description?: string;
  requiresClaimIds?: string[];
};

export type Decision = {
  id: string;
  question?: string;
  options: DecisionOption[];
  status?: string;
  selectedOptionId?: string | null;
  rationale?: string;
  [key: string]: unknown;
};

export type Artifact = {
  id?: string;
  type?: string;
  [key: string]: unknown;
};

export type LedgerEvent = {
  seq: number;
  id?: string;
  timestamp: string;
  type: string;
  actor?: string;
  sessionId?: string;
  payload?: Record<string, unknown>;
  hash?: string;
  previousHash?: string | null;
};

export type PraxiosState = {
  sessionId: string;
  revision: number;
  status: string;
  phase: SessionPhase;
  goal: string | null;
  evidence: Evidence[];
  claims: Claim[];
  tasks: Task[];
  authorizations: Authorization[];
  actions: Action[];
  decisions: Decision[];
  artifacts: Artifact[];
  createdAt: string | null;
  updatedAt: string | null;
};

export type PraxiosSnapshot = {
  state: PraxiosState;
  tasks: Task[];
  ledger: LedgerEvent[];
};

export type RuntimeHealth = {
  ok: boolean;
  service?: string;
  version?: string;
  providers?: Array<Record<string, unknown>>;
  authRequired?: boolean;
  separateHumanAuthority?: boolean;
  encryptedPersistence?: boolean;
  mode?: "remote" | "fixture" | "unconfigured";
  error?: string;
};

export type AuditResult = {
  ok: boolean;
  ledger?: { ok?: boolean; [key: string]: unknown };
  currentStateHash?: string;
  recordedStateHash?: string | null;
  stateMatchesLedger?: boolean;
  [key: string]: unknown;
};

export type AppMode = "fixture" | "remote";

export type CreateEvidenceInput = {
  kind: string;
  summary: string;
  sourceTitle?: string;
  sourceUri?: string;
  peerReviewed?: boolean;
  uncertainty?: string;
};

export type CreateClaimInput = {
  text: string;
  epistemic: EpistemicClass;
  evidenceIds: string[];
  method?: string;
  uncertainty?: string;
  confidence?: number | null;
  identifiability: "I0" | "I1" | "I2" | "I3";
  requestedUse: string;
  requireIndependentReview: boolean;
};

export type CreateActionInput = {
  title: string;
  executor: string;
  effect: string;
  payload?: unknown;
  requiredClaimIds?: string[];
  claimThreshold?: GateStatus;
};
