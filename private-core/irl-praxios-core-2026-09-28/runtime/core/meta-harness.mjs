import { STATUS } from "./policy.mjs";

const EPISTEMIC = new Set([
  "OBSERVED",
  "PUBLISHED",
  "DERIVED",
  "INFERRED",
  "HYPOTHESIS",
  "COUNTERFACTUAL",
  "UNKNOWN"
]);

const IDENTIFIABILITY_ORDER = Object.freeze({ I0: 0, I1: 1, I2: 2, I3: 3 });

function result(id, status, reason, details = {}) {
  return { id, status, reason, details };
}

function verdict(gates) {
  if (gates.some(g => g.status === STATUS.BLOCK)) return STATUS.BLOCK;
  if (gates.some(g => g.status === STATUS.REVIEW)) return STATUS.REVIEW;
  return STATUS.PASS;
}

export class MetaHarness {
  constructor({ policyEngine, ledger }) {
    this.policyEngine = policyEngine;
    this.ledger = ledger;
  }

  provenanceGate(claim, evidenceById) {
    const ids = claim.evidenceIds || [];
    if (!ids.length) {
      return result("PROVENANCE", STATUS.REVIEW, "Claim has no registered evidence references.");
    }
    const missing = ids.filter(id => !evidenceById.has(id));
    if (missing.length) {
      return result("PROVENANCE", STATUS.BLOCK, "Claim references evidence that is not registered.", { missing });
    }
    const incomplete = ids.filter(id => {
      const e = evidenceById.get(id);
      return !e.source || !e.source.title || !e.source.uri;
    });
    if (incomplete.length) {
      return result("PROVENANCE", STATUS.REVIEW, "Some evidence lacks complete source provenance.", { incomplete });
    }
    return result("PROVENANCE", STATUS.PASS, "All referenced evidence is registered with provenance.");
  }

  evidenceGate(claim, evidenceById) {
    const ids = claim.evidenceIds || [];
    const evidence = ids.map(id => evidenceById.get(id)).filter(Boolean);
    if (claim.epistemic === "OBSERVED" && !evidence.some(e => e.kind === "instrumental" || e.kind === "direct")) {
      return result("EVIDENCE", STATUS.REVIEW, "Observed claims should include direct or instrumental evidence.");
    }
    if (claim.epistemic === "PUBLISHED" && !evidence.some(e => e.peerReviewed || e.kind === "published")) {
      return result("EVIDENCE", STATUS.REVIEW, "Published claim lacks a publication-grade evidence object.");
    }
    if (["DERIVED", "INFERRED", "HYPOTHESIS"].includes(claim.epistemic) && !claim.method) {
      return result("EVIDENCE", STATUS.REVIEW, "Derived or inferential claim should declare the method that produced it.");
    }
    if (!evidence.length && claim.epistemic !== "COUNTERFACTUAL") {
      return result("EVIDENCE", STATUS.REVIEW, "No evidence is attached to the claim.");
    }
    return result("EVIDENCE", STATUS.PASS, "Evidence requirements for the declared epistemic class are satisfied.");
  }

  contradictionGate(claim) {
    const contradictions = claim.contradictions || [];
    const fatal = contradictions.filter(c => c.status === "FATAL" || c.resolution === "UNRESOLVED_FATAL");
    if (fatal.length) {
      return result("CONTRADICTION", STATUS.BLOCK, "Claim has unresolved fatal contradictions.", { fatal });
    }
    const unresolved = contradictions.filter(c => !c.resolved && c.status !== "DISMISSED");
    if (unresolved.length) {
      return result("CONTRADICTION", STATUS.REVIEW, "Claim has unresolved contradictions or alternative explanations.", { unresolved });
    }
    return result("CONTRADICTION", STATUS.PASS, "No unresolved contradiction blocks the claim.");
  }

  uncertaintyGate(claim) {
    if (claim.epistemic === "COUNTERFACTUAL") {
      return result("UNCERTAINTY", STATUS.PASS, "Counterfactual status explicitly carries uncertainty.");
    }
    const hasNumeric = Number.isFinite(claim.confidence) && claim.confidence >= 0 && claim.confidence <= 1;
    const hasQualitative = typeof claim.uncertainty === "string" && claim.uncertainty.trim().length > 0;
    if (!hasNumeric && !hasQualitative) {
      return result("UNCERTAINTY", STATUS.REVIEW, "Claim does not declare confidence or uncertainty.");
    }
    return result("UNCERTAINTY", STATUS.PASS, "Uncertainty is explicitly represented.");
  }

  identifiabilityGate(claim) {
    const declared = claim.identifiability || "I0";
    const required = claim.requiredIdentifiability || (claim.requestedUse === "publish" ? "I2" : "I0");
    if (!(declared in IDENTIFIABILITY_ORDER) || !(required in IDENTIFIABILITY_ORDER)) {
      return result("IDENTIFIABILITY", STATUS.REVIEW, "Identifiability level is missing or malformed.");
    }
    if (IDENTIFIABILITY_ORDER[declared] < IDENTIFIABILITY_ORDER[required]) {
      return result(
        "IDENTIFIABILITY",
        claim.requestedUse === "publish" ? STATUS.BLOCK : STATUS.REVIEW,
        "Current evidence does not identify the claim at the resolution required for its intended use.",
        { declared, required }
      );
    }
    return result("IDENTIFIABILITY", STATUS.PASS, "Identifiability is sufficient for the declared use.", { declared, required });
  }

  epistemicGate(claim) {
    if (!EPISTEMIC.has(claim.epistemic)) {
      return result("EPISTEMIC_CLASS", STATUS.BLOCK, "Claim has an invalid epistemic class.");
    }
    if (claim.epistemic === "UNKNOWN" && claim.requestedUse && claim.requestedUse !== "internal") {
      return result("EPISTEMIC_CLASS", STATUS.BLOCK, "UNKNOWN claims cannot be promoted to an external use.");
    }
    return result("EPISTEMIC_CLASS", STATUS.PASS, "Epistemic class is valid.");
  }

  modelIndependenceGate(claim) {
    if (!claim.requireIndependentReview) {
      return result("MODEL_INDEPENDENCE", STATUS.PASS, "Model-level independence is not required for this claim.");
    }
    const proposer = claim.proposerModel;
    const verifier = claim.verifierModel;
    if (!proposer || !verifier) {
      return result("MODEL_INDEPENDENCE", STATUS.REVIEW, "Model provenance is incomplete for independence assessment.");
    }
    if (proposer.provider === verifier.provider && proposer.model === verifier.model) {
      return result(
        "MODEL_INDEPENDENCE",
        STATUS.REVIEW,
        "Proposer and verifier are separate actors but use the same provider/model; epistemic independence is weaker.",
        { proposer, verifier }
      );
    }
    return result("MODEL_INDEPENDENCE", STATUS.PASS, "Verifier uses a different provider/model from the proposer.", { proposer, verifier });
  }

  reviewCoverageGate(claim, verifierId) {
    if (!claim.requireIndependentReview) {
      return result("REVIEW_COVERAGE", STATUS.PASS, "Independent review record is not required for this claim.");
    }
    const reviews = claim.reviews || [];
    const covered = reviews.some(review => review.verifierId === verifierId);
    if (!covered) {
      return result("REVIEW_COVERAGE", STATUS.BLOCK, "Claim requires a recorded independent review from the verifier.");
    }
    return result("REVIEW_COVERAGE", STATUS.PASS, "Independent review is recorded.");
  }

  claimDependencyGate(action, claims = []) {
    const required = action.requiredClaimIds || [];
    if (!required.length) {
      return result("CLAIM_DEPENDENCY", STATUS.PASS, "Action has no required claim dependencies.");
    }
    const byId = new Map(claims.map(claim => [claim.id, claim]));
    const missing = required.filter(id => !byId.has(id));
    if (missing.length) {
      return result("CLAIM_DEPENDENCY", STATUS.BLOCK, "Action references unknown claims.", { missing });
    }
    const blocked = required.filter(id => byId.get(id).verdict === STATUS.BLOCK);
    if (blocked.length) {
      return result("CLAIM_DEPENDENCY", STATUS.BLOCK, "Action depends on blocked claims.", { blocked });
    }
    const review = required.filter(id => byId.get(id).verdict === STATUS.REVIEW);
    if (review.length && action.claimThreshold === "PASS") {
      return result("CLAIM_DEPENDENCY", STATUS.BLOCK, "Action requires PASS claims but some remain under review.", { review });
    }
    if (review.length) {
      return result("CLAIM_DEPENDENCY", STATUS.REVIEW, "Action depends on claims that remain under review.", { review });
    }
    return result("CLAIM_DEPENDENCY", STATUS.PASS, "All required claims satisfy the action dependency policy.");
  }

  async auditGate() {
    const check = await this.ledger.verify();
    if (!check.ok) {
      return result("AUDIT", STATUS.BLOCK, "Ledger integrity verification failed.", check);
    }
    return result("AUDIT", STATUS.PASS, "Ledger hash chain is valid.", check);
  }

  async evaluateClaim(claim, { evidence = [], proposerId = null, verifierId = null } = {}) {
    const evidenceById = new Map(evidence.map(item => [item.id, item]));
    const gates = [
      this.epistemicGate(claim),
      this.provenanceGate(claim, evidenceById),
      this.evidenceGate(claim, evidenceById),
      this.contradictionGate(claim),
      this.uncertaintyGate(claim),
      this.identifiabilityGate(claim),
      this.policyEngine.evaluateRoleSeparation({ proposerId, verifierId }),
      this.reviewCoverageGate(claim, verifierId),
      this.modelIndependenceGate(claim)
    ];
    if (claim.requestedUse === "publish") gates.push(this.policyEngine.evaluatePublication(claim));
    gates.push(await this.auditGate());
    return { verdict: verdict(gates), gates };
  }

  async evaluateAction(action, { authorization = null, claims = [] } = {}) {
    const gates = [
      this.policyEngine.evaluateWall(action),
      this.claimDependencyGate(action, claims),
      this.policyEngine.evaluateAuthorization(action, authorization),
      await this.auditGate()
    ];
    return { verdict: verdict(gates), gates };
  }
}

export { verdict as aggregateVerdict };
