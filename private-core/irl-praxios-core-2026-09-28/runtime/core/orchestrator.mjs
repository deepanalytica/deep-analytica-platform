import {
  validatePlannerOutput,
  validateWorkerOutput,
  validateReviewOutput
} from "./contracts.mjs";
import { ExecutionBudget, withAbortTimeout } from "./budget.mjs";
import { sha256Hex } from "./ledger.mjs";

function stripCodeFence(text) {
  const s = String(text || "").trim();
  const fence = "\x60\x60\x60";
  if (!s.startsWith(fence)) return s;
  return s.replace(/^\x60\x60\x60(?:json)?\s*/i, "").replace(/\s*\x60\x60\x60$/, "");
}

export function parseJsonOutput(text) {
  const raw = stripCodeFence(text);
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error("Provider did not return valid JSON.");
  }
}

export class ProviderRegistry {
  constructor() {
    this.providers = new Map();
  }

  register(name, provider, metadata = {}) {
    if (!name || !provider || typeof provider.generate !== "function") {
      throw new Error("Provider must implement generate().");
    }
    this.providers.set(name, { provider, metadata: { ...metadata } });
    return this;
  }

  get(name) {
    const entry = this.providers.get(name);
    if (!entry) throw new Error("Unknown provider: " + name);
    return entry.provider;
  }

  describe(name) {
    const entry = this.providers.get(name);
    if (!entry) return null;
    return { name, ...entry.metadata };
  }

  list() {
    return Array.from(this.providers.entries()).map(([name, entry]) => ({
      name,
      ...entry.metadata
    }));
  }
}

function modelIdentity(slot, role) {
  return {
    actorId: slot.actorId || role + ":" + slot.provider + ":" + slot.model,
    provider: slot.provider,
    model: slot.model,
    role
  };
}

function sameModel(a, b) {
  return a?.provider === b?.provider && a?.model === b?.model;
}

export class PraxiosOrchestrator {
  constructor({
    runtime,
    providers,
    budget = {},
    providerTimeoutMs = 60000
  }) {
    this.runtime = runtime;
    this.providers = providers || new ProviderRegistry();
    this.budget = budget instanceof ExecutionBudget ? budget : new ExecutionBudget(budget);
    this.providerTimeoutMs = providerTimeoutMs;
  }

  async callProvider(slot, request) {
    if (!slot?.provider || !slot?.model) throw new Error("Provider slot requires provider and model.");
    this.budget.registerProviderCall(request.input);
    const provider = this.providers.get(slot.provider);
    const started = Date.now();
    const inputHash = await sha256Hex(String(request.system || "") + "\n" + String(request.input || ""));
    await this.runtime.emit("MODEL_CALL_STARTED", {
      role: request.role || "worker",
      provider: slot.provider,
      model: slot.model,
      inputHash,
      inputChars: String(request.input || "").length
    }, request.actor || "praxios");

    try {
      const text = await withAbortTimeout(
        signal => provider.generate({
          model: slot.model,
          system: request.system,
          input: request.input,
          metadata: request.metadata || {},
          signal
        }),
        request.timeoutMs || this.providerTimeoutMs
      );
      const outputText = typeof text === "string" ? text : JSON.stringify(text);
      this.budget.registerProviderOutput(outputText);
      await this.runtime.emit("MODEL_CALL_COMPLETED", {
        role: request.role || "worker",
        provider: slot.provider,
        model: slot.model,
        latencyMs: Date.now() - started,
        outputHash: await sha256Hex(outputText),
        outputChars: outputText.length
      }, request.actor || "praxios");
      return request.expectJson ? parseJsonOutput(outputText) : text;
    } catch (error) {
      await this.runtime.emit("MODEL_CALL_FAILED", {
        role: request.role || "worker",
        provider: slot.provider,
        model: slot.model,
        latencyMs: Date.now() - started,
        error: error?.name || "Error",
        message: String(error?.message || error).slice(0, 1000)
      }, request.actor || "praxios");
      throw error;
    }
  }

  async runGoal({
    goal,
    planner,
    workers = {},
    verifier,
    actor = "human",
    decision = {}
  }) {
    if (!planner || !verifier) throw new Error("Planner and verifier slots are required.");
    const workerSlots = Object.keys(workers);
    if (!workerSlots.length) throw new Error("At least one worker slot is required.");

    await this.runtime.start(goal, actor);
    await this.runtime.setPhase("REASON", "Planner decomposes the goal.");

    const plannerIdentity = modelIdentity(planner, "planner");
    const verifierIdentity = modelIdentity(verifier, "verifier");

    const plan = validatePlannerOutput(await this.callProvider(planner, {
      role: "planner",
      actor: plannerIdentity.actorId,
      expectJson: true,
      system:
        "You are the PRAXIOS planner. Return JSON only. " +
        "Create a minimal acyclic task DAG. Each task requires id, title, role, input, dependsOn, workerSlot. " +
        "Allowed workerSlot values: " + workerSlots.join(", ") + ". " +
        "Do not claim results and do not authorize actions.",
      input: goal
    }), { maxTasks: this.budget.limits.maxTasks });

    this.budget.registerTasks(plan.tasks.length);
    await this.runtime.emit("PLAN_ACCEPTED", {
      taskCount: plan.tasks.length,
      planner: plannerIdentity
    }, plannerIdentity.actorId);
    await this.runtime.setPhase("PROPOSE", "Register validated delegated work.");

    const registeredSlots = new Set();
    for (const task of plan.tasks) {
      const workerSlot = workers[task.workerSlot];
      if (!workerSlot) throw new Error("Planner requested unknown worker slot: " + task.workerSlot);
      const identity = modelIdentity(workerSlot, "worker:" + task.workerSlot);

      if (!registeredSlots.has(task.workerSlot)) {
        this.runtime.registerProvider(task.workerSlot, {
          generate: request =>
            this.callProvider(workerSlot, {
              role: request.role || identity.role,
              actor: identity.actorId,
              expectJson: true,
              system:
                "You are a PRAXIOS worker. Return JSON only with keys summary, evidence, claims, proposedActions. " +
                "Evidence items: id, kind, summary, source{title,uri}, peerReviewed when known, uncertainty. " +
                "Claims: id, text, epistemic, evidenceIds, method, uncertainty or confidence, identifiability, requiredIdentifiability, contradictions, requestedUse. " +
                "Never mark your own claim as verified. Separate observation, publication, derivation, inference, hypothesis and counterfactual. " +
                "Proposed actions must include id, title, executor and may include requiredClaimIds and claimThreshold. " +
                "Use only executors present in executorCatalog.",
              input: JSON.stringify({
                task: request.input,
                dependencies: request.metadata?.dependencies || [],
                goal,
                executorCatalog: this.runtime.listExecutors()
              }),
              metadata: request.metadata
            }).then(validateWorkerOutput)
        });
        registeredSlots.add(task.workerSlot);
      }

      await this.runtime.delegateTask({
        id: task.id,
        title: task.title,
        role: task.role || task.workerSlot,
        provider: task.workerSlot,
        model: workerSlot.model,
        input: task.input,
        dependsOn: task.dependsOn || [],
        metadata: {
          workerSlot: task.workerSlot,
          workerActor: identity.actorId,
          workerProvider: workerSlot.provider,
          workerModel: workerSlot.model
        }
      }, plannerIdentity.actorId);
    }

    const taskResults = await this.runtime.runTasks();

    const proposedActions = [];
    for (const task of taskResults) {
      if (task.status !== "COMPLETED" || !task.output) continue;
      const output = validateWorkerOutput(task.output);
      const proposerId = task.metadata?.workerActor || "worker:" + task.id;
      const proposerModel = {
        provider: task.metadata?.workerProvider || null,
        model: task.metadata?.workerModel || task.model || null
      };

      for (const evidence of output.evidence || []) {
        const existing = this.runtime.state.evidence.find(item => item.id === evidence.id);
        if (!existing) {
          await this.runtime.addEvidence(evidence, proposerId);
        } else if (JSON.stringify(existing) !== JSON.stringify({
          id: evidence.id,
          kind: evidence.kind || "reported",
          summary: evidence.summary || "",
          source: evidence.source || null,
          peerReviewed: Boolean(evidence.peerReviewed),
          uncertainty: evidence.uncertainty || null,
          capturedAt: evidence.capturedAt || null,
          metadata: evidence.metadata || {}
        })) {
          throw new Error("Conflicting evidence id emitted by workers: " + evidence.id);
        }
      }

      for (const claim of output.claims || []) {
        if (this.runtime.state.claims.some(item => item.id === claim.id)) {
          throw new Error("Duplicate claim id emitted by workers: " + claim.id);
        }
        await this.runtime.proposeClaim({
          ...claim,
          proposerId,
          proposerModel,
          requireIndependentReview: true
        }, proposerId);
      }

      for (const action of output.proposedActions || []) {
        proposedActions.push({ ...action, proposedBy: proposerId });
      }
    }

    await this.runtime.setPhase("VERIFY", "Independent verifier reviews registered claims.");

    const verifierInput = {
      goal,
      evidence: this.runtime.state.evidence,
      claims: this.runtime.state.claims.map(claim => ({
        id: claim.id,
        text: claim.text,
        epistemic: claim.epistemic,
        evidenceIds: claim.evidenceIds,
        method: claim.method,
        uncertainty: claim.uncertainty,
        confidence: claim.confidence,
        identifiability: claim.identifiability,
        requiredIdentifiability: claim.requiredIdentifiability,
        contradictions: claim.contradictions,
        requestedUse: claim.requestedUse,
        proposerId: claim.proposerId,
        proposerModel: claim.proposerModel
      })),
      taskSummaries: taskResults.map(task => ({
        id: task.id,
        role: task.role,
        status: task.status,
        summary: task.output?.summary || null
      })),
      executorCatalog: this.runtime.listExecutors()
    };

    const reviewOutput = validateReviewOutput(await this.callProvider(verifier, {
      role: "verifier",
      actor: verifierIdentity.actorId,
      expectJson: true,
      system:
        "You are the independent Meta-Harness verifier. Return JSON only with summary, reviews, proposedActions. " +
        "Do not create new claims. Review each existing claim by claimId. " +
        "Each review may include summary, contradictions, uncertainty and a conservative identifiability level. " +
        "You may lower identifiability but must not promote a claim to fact. " +
        "Proposed actions must use an executor from executorCatalog. Do not authorize actions.",
      input: JSON.stringify(verifierInput)
    }), this.runtime.state.claims.map(claim => claim.id));

    const reviewByClaim = new Map((reviewOutput.reviews || []).map(review => [review.claimId, review]));
    for (const claim of this.runtime.state.claims) {
      const review = reviewByClaim.get(claim.id);
      if (review) {
        await this.runtime.applyClaimReview(claim.id, review, {
          verifierId: verifierIdentity.actorId,
          verifierModel: {
            provider: verifier.provider,
            model: verifier.model
          },
          actor: verifierIdentity.actorId
        });
      }
    }

    const claimEvaluations = [];
    for (const claim of this.runtime.state.claims) {
      const evaluation = await this.runtime.verifyClaim(claim.id, {
        verifierId: verifierIdentity.actorId,
        verifierModel: {
          provider: verifier.provider,
          model: verifier.model
        },
        actor: verifierIdentity.actorId
      });
      claimEvaluations.push({ claimId: claim.id, ...evaluation });
    }

    for (const action of reviewOutput.proposedActions || []) {
      proposedActions.push({ ...action, proposedBy: verifierIdentity.actorId });
    }

    const authorizationRequests = [];
    const rejectedActions = [];
    for (const action of proposedActions) {
      try {
        const request = await this.runtime.requestAuthorization(action, action.proposedBy || "praxios");
        authorizationRequests.push(request);
      } catch (error) {
        rejectedActions.push({
          actionId: action.id,
          reason: String(error?.message || error)
        });
        await this.runtime.emit("ACTION_PROPOSAL_REJECTED", {
          actionId: action.id,
          reason: String(error?.message || error)
        }, "meta-harness");
      }
    }

    const options = authorizationRequests.map(request => ({
      id: "authorize:" + request.actionId,
      label: "Authorize " + request.action.title,
      actionId: request.actionId,
      authorizationId: request.id,
      requiresClaimIds: request.action.requiredClaimIds || []
    }));
    options.push({ id: "hold", label: "Hold and request more evidence" });

    const decisionPackage = await this.runtime.createDecisionPackage({
      id: decision.id || "DR-001",
      title: decision.title || "PRAXIOS decision package",
      situation: decision.situation || goal,
      risks: decision.risks || [],
      options
    }, "praxios");

    await this.runtime.emit("ORCHESTRATION_COMPLETED", {
      planner: plannerIdentity,
      verifier: verifierIdentity,
      samePlannerVerifierModel: sameModel(planner, verifier),
      taskCount: taskResults.length,
      claimCount: this.runtime.state.claims.length,
      authorizationCount: authorizationRequests.length,
      rejectedActionCount: rejectedActions.length,
      budget: this.budget.snapshot()
    }, "praxios");

    return {
      goal,
      plan,
      taskResults,
      review: reviewOutput,
      claimEvaluations,
      authorizationRequests,
      rejectedActions,
      decisionPackage,
      budget: this.budget.snapshot(),
      snapshot: this.runtime.snapshot()
    };
  }
}
