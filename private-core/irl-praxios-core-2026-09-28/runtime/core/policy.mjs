import { canonicalJson } from "./ledger.mjs";

export const STATUS = Object.freeze({
  PASS: "PASS",
  REVIEW: "REVIEW",
  BLOCK: "BLOCK"
});

export const DEFAULT_POLICY = Object.freeze({
  version: "1.0.0",
  requireIndependentVerifier: true,
  requireAuthorizationForEffects: ["write", "external", "financial", "publish"],
  hardWalls: [
    {
      id: "WALL_SECRET_EXPORT",
      description: "Secrets may not be exported through model or tool actions.",
      tags: ["secret_export"]
    },
    {
      id: "WALL_BYPASS_LEDGER",
      description: "Effectful execution cannot bypass the canonical ledger.",
      tags: ["bypass_ledger"]
    },
    {
      id: "WALL_EXECUTOR_DISABLED",
      description: "Disabled executors are structurally unavailable.",
      tags: ["executor_disabled"]
    },
    {
      id: "WALL_EXECUTOR_UNREGISTERED",
      description: "Actions cannot target an executor that is absent from the trusted registry.",
      tags: ["executor_unregistered"]
    }
  ],
  publication: {
    requireSources: true,
    blockEpistemicClasses: ["UNKNOWN"],
    reviewEpistemicClasses: ["INFERRED", "HYPOTHESIS", "COUNTERFACTUAL"]
  }
});

export class PolicyEngine {
  constructor(policy = DEFAULT_POLICY) {
    this.policy = structuredClone(policy);
  }

  evaluateWall(action = {}) {
    const tags = new Set(action.tags || []);
    for (const wall of this.policy.hardWalls || []) {
      if ((wall.tags || []).some(tag => tags.has(tag))) {
        return {
          id: wall.id,
          status: STATUS.BLOCK,
          reason: wall.description,
          wall: true
        };
      }
    }
    return {
      id: "WALLS_CLEAR",
      status: STATUS.PASS,
      reason: "No structural wall matched.",
      wall: false
    };
  }

  evaluateRoleSeparation({ proposerId, verifierId }) {
    if (!this.policy.requireIndependentVerifier) {
      return { id: "ROLE_SEPARATION", status: STATUS.PASS, reason: "Independent verifier policy disabled." };
    }
    if (!proposerId || !verifierId) {
      return { id: "ROLE_SEPARATION", status: STATUS.REVIEW, reason: "Proposer or verifier identity is missing." };
    }
    if (proposerId === verifierId) {
      return { id: "ROLE_SEPARATION", status: STATUS.BLOCK, reason: "Proposer and verifier must be distinct actors." };
    }
    return { id: "ROLE_SEPARATION", status: STATUS.PASS, reason: "Proposer and verifier are independent." };
  }

  evaluatePublication(claim = {}) {
    const p = this.policy.publication || {};
    if (p.requireSources && !(claim.evidenceIds || []).length) {
      return { id: "PUBLICATION_POLICY", status: STATUS.BLOCK, reason: "Publication requires at least one registered evidence source." };
    }
    if ((p.blockEpistemicClasses || []).includes(claim.epistemic)) {
      return { id: "PUBLICATION_POLICY", status: STATUS.BLOCK, reason: "Epistemic class is blocked for publication." };
    }
    if ((p.reviewEpistemicClasses || []).includes(claim.epistemic)) {
      return { id: "PUBLICATION_POLICY", status: STATUS.REVIEW, reason: "Epistemic class requires explicit review before publication." };
    }
    return { id: "PUBLICATION_POLICY", status: STATUS.PASS, reason: "Publication policy satisfied." };
  }

  evaluateAuthorization(action = {}, authorization = null) {
    const effect = action.effect || "none";
    const required = (this.policy.requireAuthorizationForEffects || []).includes(effect);
    if (!required) {
      return { id: "AUTHORIZATION", status: STATUS.PASS, reason: "Action does not require explicit authorization." };
    }
    if (!authorization) {
      return { id: "AUTHORIZATION", status: STATUS.BLOCK, reason: "Effectful action requires explicit authorization." };
    }
    if (authorization.status !== "APPROVED") {
      return { id: "AUTHORIZATION", status: STATUS.BLOCK, reason: "Authorization is not approved." };
    }
    if (authorization.consumed) {
      return { id: "AUTHORIZATION", status: STATUS.BLOCK, reason: "Authorization has already been consumed." };
    }
    if (authorization.actionId !== action.id) {
      return { id: "AUTHORIZATION", status: STATUS.BLOCK, reason: "Authorization does not match the requested action." };
    }
    if (authorization.action && canonicalJson(authorization.action) !== canonicalJson(action)) {
      return { id: "AUTHORIZATION", status: STATUS.BLOCK, reason: "Authorized action payload differs from the action being executed." };
    }
    return { id: "AUTHORIZATION", status: STATUS.PASS, reason: "Explicit authorization matches the exact action." };
  }
}
