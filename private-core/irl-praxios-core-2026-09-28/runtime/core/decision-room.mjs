function clone(value) {
  return structuredClone(value);
}

export class DecisionRoom {
  constructor({ runtime }) {
    this.runtime = runtime;
  }

  build({
    id,
    title = "Decision package",
    situation = "",
    options = [],
    risks = [],
    actor = "praxios"
  } = {}) {
    const state = this.runtime.state;
    const claims = state.claims || [];
    const verified = claims.filter(c => c.verdict === "PASS");
    const review = claims.filter(c => c.verdict === "REVIEW");
    const blocked = claims.filter(c => c.verdict === "BLOCK");
    const evidence = state.evidence || [];

    return {
      id: id || "decision-package-" + (state.decisions.length + 1),
      title,
      situation,
      evidence: clone(evidence),
      findings: clone(verified),
      unknowns: clone(review),
      excludedClaims: clone(blocked),
      risks: clone(risks),
      options: clone(options),
      authorizations: clone((state.authorizations || []).filter(a => a.status === "PENDING")),
      actor,
      status: "AWAITING_HUMAN",
      createdFromRevision: state.revision
    };
  }

  validateSelection(decisionPackage, selectedOptionId) {
    const option = (decisionPackage.options || []).find(o => o.id === selectedOptionId);
    if (!option) throw new Error("Selected option does not exist in decision package.");
    if (option.requiresClaimIds?.length) {
      const byId = new Map(this.runtime.state.claims.map(c => [c.id, c]));
      const invalid = option.requiresClaimIds.filter(id => byId.get(id)?.verdict !== "PASS");
      if (invalid.length) {
        throw new Error("Decision option depends on claims that have not passed Meta-Harness: " + invalid.join(", "));
      }
    }
    return clone(option);
  }
}
