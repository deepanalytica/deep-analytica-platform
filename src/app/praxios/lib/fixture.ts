import type {
  Action,
  AuditResult,
  Authorization,
  Claim,
  CreateActionInput,
  CreateClaimInput,
  CreateEvidenceInput,
  Decision,
  Evidence,
  GateResult,
  GateStatus,
  LedgerEvent,
  PraxiosSnapshot,
} from "./types";

const STORAGE_KEY = "praxios.webos.fixture.v1";

type Store = {
  sessions: Record<string, PraxiosSnapshot>;
};

function now() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return prefix + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function loadStore(): Store {
  if (typeof window === "undefined") return { sessions: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : { sessions: {} };
  } catch {
    return { sessions: {} };
  }
}

function saveStore(store: Store) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function append(snapshot: PraxiosSnapshot, type: string, payload: Record<string, unknown> = {}, actor = "fixture") {
  const event: LedgerEvent = {
    seq: snapshot.ledger.length + 1,
    id: uid("evt"),
    timestamp: now(),
    type,
    actor,
    sessionId: snapshot.state.sessionId,
    payload,
  };
  snapshot.ledger.push(event);
  snapshot.state.revision = event.seq;
  snapshot.state.updatedAt = event.timestamp;
}

function persist(snapshot: PraxiosSnapshot) {
  const store = loadStore();
  store.sessions[snapshot.state.sessionId] = clone(snapshot);
  saveStore(store);
  return clone(snapshot);
}

function verdictFromGates(gates: GateResult[]): GateStatus {
  if (gates.some((gate) => gate.status === "BLOCK")) return "BLOCK";
  if (gates.some((gate) => gate.status === "REVIEW")) return "REVIEW";
  return "PASS";
}

function evaluateClaim(claim: Claim, evidence: Evidence[]): GateResult[] {
  const linked = evidence.filter((item) => claim.evidenceIds.includes(item.id));
  const independent = linked.some((item) => item.kind !== "user_input" && item.kind !== "synthetic");
  const gates: GateResult[] = [
    {
      id: "EPISTEMIC_CLASS",
      status: claim.epistemic === "UNKNOWN" ? "BLOCK" : claim.epistemic === "HYPOTHESIS" || claim.epistemic === "COUNTERFACTUAL" ? "REVIEW" : "PASS",
      reason:
        claim.epistemic === "UNKNOWN"
          ? "Unknown claims cannot ascend."
          : claim.epistemic === "HYPOTHESIS" || claim.epistemic === "COUNTERFACTUAL"
            ? "Hypotheses require explicit review."
            : "Epistemic class is admissible.",
    },
    {
      id: "EVIDENCE",
      status: linked.length ? "PASS" : "BLOCK",
      reason: linked.length ? linked.length + " evidence item(s) linked." : "No registered evidence is linked.",
    },
    {
      id: "PROVENANCE",
      status: linked.every((item) => item.source?.uri || item.kind === "user_input") ? "PASS" : linked.length ? "REVIEW" : "BLOCK",
      reason: linked.every((item) => item.source?.uri || item.kind === "user_input")
        ? "Linked evidence has declared provenance."
        : "Some evidence lacks a source URI.",
    },
    {
      id: "UNCERTAINTY",
      status: claim.uncertainty || typeof claim.confidence === "number" ? "PASS" : "REVIEW",
      reason: claim.uncertainty || typeof claim.confidence === "number" ? "Uncertainty is explicit." : "Uncertainty is not explicit.",
    },
    {
      id: "IDENTIFIABILITY",
      status: claim.identifiability === "I0" && claim.requestedUse === "publication" ? "REVIEW" : "PASS",
      reason: "Identifiability level is " + claim.identifiability + ".",
    },
    {
      id: "ROLE_SEPARATION",
      status: claim.requireIndependentReview
        ? claim.reviews.length
          ? "PASS"
          : "REVIEW"
        : "PASS",
      reason: claim.requireIndependentReview
        ? claim.reviews.length
          ? "Independent review is recorded."
          : "Independent review is required."
        : "Independent review not required for this fixture claim.",
    },
    {
      id: "MODEL_INDEPENDENCE",
      status: claim.requireIndependentReview && !claim.reviews.length ? "REVIEW" : "PASS",
      reason: claim.requireIndependentReview && !claim.reviews.length ? "Verifier identity is not yet recorded." : "No model-independence conflict recorded.",
    },
    {
      id: "OUTSIDE",
      status: independent ? "PASS" : linked.length ? "REVIEW" : "BLOCK",
      reason: independent ? "At least one non-user, non-synthetic evidence item exists." : "No independent Outside is registered.",
    },
  ];
  return gates;
}

function seedDecision(snapshot: PraxiosSnapshot) {
  if (snapshot.state.decisions.length) return;
  const decision: Decision = {
    id: uid("D"),
    question: "What should happen next?",
    status: "OPEN",
    options: [
      {
        id: "continue-evidence",
        label: "Acquire more evidence",
        description: "Keep the mission open and target the largest epistemic debt.",
      },
      {
        id: "hold",
        label: "Hold",
        description: "Freeze the mission without promoting any unresolved claim.",
      },
      {
        id: "prepare-output",
        label: "Prepare bounded output",
        description: "Generate a decision package using only PASS claims.",
        requiresClaimIds: snapshot.state.claims.filter((claim) => claim.verdict === "PASS").map((claim) => claim.id),
      },
    ],
  };
  snapshot.state.decisions.push(decision);
  append(snapshot, "DECISION_PACKAGE_CREATED", { decisionId: decision.id });
}

export const fixtureRuntime = {
  health() {
    return {
      ok: true,
      service: "praxios-fixture",
      version: "1.0.0",
      providers: [{ name: "fixture", configured: true }],
      authRequired: false,
      separateHumanAuthority: true,
      encryptedPersistence: false,
      mode: "fixture" as const,
    };
  },

  listSessions() {
    const store = loadStore();
    return Object.values(store.sessions)
      .sort((a, b) => String(b.state.updatedAt).localeCompare(String(a.state.updatedAt)))
      .map(clone);
  },

  createSession(goal: string): PraxiosSnapshot {
    const sessionId = uid("session");
    const timestamp = now();
    const snapshot: PraxiosSnapshot = {
      state: {
        sessionId,
        revision: 0,
        status: "RUNNING",
        phase: "OBSERVE",
        goal,
        evidence: [],
        claims: [],
        tasks: [],
        authorizations: [],
        actions: [],
        decisions: [],
        artifacts: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      tasks: [],
      ledger: [],
    };
    append(snapshot, "SESSION_STARTED", { goal }, "human:webos");
    seedDecision(snapshot);
    return persist(snapshot);
  },

  getSession(sessionId: string) {
    const snapshot = loadStore().sessions[sessionId];
    if (!snapshot) throw new Error("Unknown fixture session: " + sessionId);
    return clone(snapshot);
  },

  addEvidence(sessionId: string, input: CreateEvidenceInput) {
    const snapshot = this.getSession(sessionId);
    const evidence: Evidence = {
      id: uid("E"),
      kind: input.kind || "reported",
      summary: input.summary,
      source:
        input.sourceTitle || input.sourceUri
          ? { title: input.sourceTitle || "", uri: input.sourceUri || "" }
          : null,
      peerReviewed: Boolean(input.peerReviewed),
      uncertainty: input.uncertainty || null,
      capturedAt: now(),
      metadata: { fixture: true },
    };
    snapshot.state.evidence.push(evidence);
    append(snapshot, "EVIDENCE_REGISTERED", { evidenceId: evidence.id }, "human:webos");
    return { evidence, snapshot: persist(snapshot) };
  },

  addClaim(sessionId: string, input: CreateClaimInput) {
    const snapshot = this.getSession(sessionId);
    const claim: Claim = {
      id: uid("C"),
      text: input.text,
      epistemic: input.epistemic,
      evidenceIds: input.evidenceIds,
      method: input.method || null,
      confidence: input.confidence ?? null,
      uncertainty: input.uncertainty || null,
      identifiability: input.identifiability,
      requiredIdentifiability: null,
      contradictions: [],
      requestedUse: input.requestedUse,
      proposerId: "human:proposer",
      verifierId: null,
      status: "PROPOSED",
      verdict: null,
      gates: [],
      reviews: [],
      requireIndependentReview: input.requireIndependentReview,
    };
    snapshot.state.claims.push(claim);
    snapshot.state.phase = "PROPOSE";
    append(snapshot, "CLAIM_PROPOSED", { claimId: claim.id }, claim.proposerId);
    return { claim, snapshot: persist(snapshot) };
  },

  reviewClaim(sessionId: string, claimId: string, summary: string) {
    const snapshot = this.getSession(sessionId);
    const claim = snapshot.state.claims.find((item) => item.id === claimId);
    if (!claim) throw new Error("Unknown claim: " + claimId);
    claim.reviews.push({
      verifierId: "human:independent-verifier",
      summary,
      timestamp: now(),
    });
    claim.verifierId = "human:independent-verifier";
    append(snapshot, "CLAIM_REVIEW_RECORDED", { claimId, summary }, "human:independent-verifier");
    return persist(snapshot);
  },

  verifyClaim(sessionId: string, claimId: string) {
    const snapshot = this.getSession(sessionId);
    const claim = snapshot.state.claims.find((item) => item.id === claimId);
    if (!claim) throw new Error("Unknown claim: " + claimId);
    const gates = evaluateClaim(claim, snapshot.state.evidence);
    claim.gates = gates;
    claim.verdict = verdictFromGates(gates);
    claim.status = "EVALUATED";
    snapshot.state.phase = "VERIFY";
    append(snapshot, "CLAIM_EVALUATED", { claimId, verdict: claim.verdict, gates }, "meta-harness:fixture");
    seedDecision(snapshot);
    return { evaluation: { verdict: claim.verdict, gates }, snapshot: persist(snapshot) };
  },

  requestAuthorization(sessionId: string, input: CreateActionInput) {
    const snapshot = this.getSession(sessionId);
    const action: Action = {
      id: uid("A"),
      title: input.title,
      executor: input.executor,
      effect: input.effect,
      payload: input.payload ?? null,
      requiredClaimIds: input.requiredClaimIds || [],
      claimThreshold: input.claimThreshold || "PASS",
      status: "PROPOSED",
    };
    const required = snapshot.state.claims.filter((claim) => action.requiredClaimIds?.includes(claim.id));
    const blockedByClaims = required.some((claim) => claim.verdict !== (action.claimThreshold || "PASS"));
    const hardWall = action.executor === "unregistered" || action.tags?.includes("secret_export");
    const status = hardWall || blockedByClaims ? "DENIED" : action.effect === "none" ? "APPROVED" : "PENDING";
    const authorization: Authorization = {
      id: uid("AUTH"),
      actionId: action.id,
      action: clone(action),
      status,
      consumed: false,
      requestedBy: "human:webos",
      reason: hardWall ? "Structural wall matched." : blockedByClaims ? "Required claims have not passed." : "",
    };
    snapshot.state.actions.push(action);
    snapshot.state.authorizations.push(authorization);
    snapshot.state.phase = "AUTHORIZE";
    append(snapshot, "AUTHORIZATION_REQUESTED", { authorizationId: authorization.id, actionId: action.id, status }, "human:webos");
    return { request: authorization, snapshot: persist(snapshot) };
  },

  decideAuthorization(sessionId: string, authorizationId: string, approved: boolean, reason: string) {
    const snapshot = this.getSession(sessionId);
    const authorization = snapshot.state.authorizations.find((item) => item.id === authorizationId);
    if (!authorization) throw new Error("Unknown authorization: " + authorizationId);
    if (authorization.status !== "PENDING") throw new Error("Authorization is not pending.");
    authorization.status = approved ? "APPROVED" : "DENIED";
    authorization.approvedBy = "human:webos";
    authorization.reason = reason;
    append(snapshot, approved ? "AUTHORIZATION_APPROVED" : "AUTHORIZATION_DENIED", { authorizationId, reason }, "human:webos");
    return persist(snapshot);
  },

  executeAction(sessionId: string, actionId: string) {
    const snapshot = this.getSession(sessionId);
    const action = snapshot.state.actions.find((item) => item.id === actionId);
    if (!action) throw new Error("Unknown action: " + actionId);
    const authorization = snapshot.state.authorizations.find((item) => item.actionId === action.id);
    if (action.effect !== "none" && (!authorization || authorization.status !== "APPROVED" || authorization.consumed)) {
      throw new Error("Effectful action requires an unused approved authorization.");
    }
    if (authorization) authorization.consumed = true;
    action.status = "EXECUTED";
    snapshot.state.phase = "EXECUTE";
    const artifact = {
      id: uid("artifact"),
      type: action.executor,
      fixture: true,
      payload: action.payload ?? null,
    };
    snapshot.state.artifacts.push(artifact);
    append(snapshot, "ACTION_EXECUTED", { actionId, artifactId: artifact.id }, "praxios:fixture");
    snapshot.state.phase = "OBSERVE";
    append(snapshot, "PHASE_CHANGED", { to: "OBSERVE", reason: "Execution completed." }, "praxios:fixture");
    return { result: { ok: true, artifact }, snapshot: persist(snapshot) };
  },

  selectDecision(sessionId: string, decisionId: string, optionId: string, rationale: string) {
    const snapshot = this.getSession(sessionId);
    const decision = snapshot.state.decisions.find((item) => item.id === decisionId);
    if (!decision) throw new Error("Unknown decision: " + decisionId);
    const option = decision.options.find((item) => item.id === optionId);
    if (!option) throw new Error("Unknown decision option.");
    const unmet = (option.requiresClaimIds || []).filter(
      (claimId) => snapshot.state.claims.find((claim) => claim.id === claimId)?.verdict !== "PASS",
    );
    if (unmet.length) throw new Error("Decision option requires PASS claims: " + unmet.join(", "));
    decision.status = "SELECTED";
    decision.selectedOptionId = optionId;
    decision.rationale = rationale;
    append(snapshot, "DECISION_SELECTED", { decisionId, optionId, rationale }, "human:webos");
    return persist(snapshot);
  },

  audit(sessionId: string): AuditResult {
    const snapshot = this.getSession(sessionId);
    let ok = true;
    for (let index = 0; index < snapshot.ledger.length; index += 1) {
      if (snapshot.ledger[index].seq !== index + 1) ok = false;
    }
    return {
      ok,
      ledger: { ok, events: snapshot.ledger.length },
      stateMatchesLedger: true,
      currentStateHash: "fixture:" + snapshot.state.revision,
      recordedStateHash: "fixture:" + snapshot.state.revision,
    };
  },

  reset() {
    saveStore({ sessions: {} });
  },
};
