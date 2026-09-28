const ID = /^[A-Za-z0-9._:-]{1,128}$/;

export class ContractError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ContractError";
    this.details = details;
  }
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ContractError(label + " must be an object.");
  }
  return value;
}

function requireId(value, label = "id") {
  if (typeof value !== "string" || !ID.test(value)) {
    throw new ContractError(label + " must match " + ID);
  }
  return value;
}

function requireString(value, label, { min = 1, max = 20000 } = {}) {
  if (typeof value !== "string") throw new ContractError(label + " must be a string.");
  const s = value.trim();
  if (s.length < min || s.length > max) throw new ContractError(label + " length out of bounds.");
  return s;
}

export function validateEvidence(input) {
  const e = requireObject(input, "evidence");
  requireId(e.id, "evidence.id");
  requireString(e.summary || "", "evidence.summary", { min: 1, max: 12000 });
  if (e.source != null) {
    requireObject(e.source, "evidence.source");
    requireString(e.source.title || "", "evidence.source.title", { min: 1, max: 1000 });
    requireString(e.source.uri || "", "evidence.source.uri", { min: 1, max: 4000 });
  }
  return e;
}

export function validateClaim(input) {
  const c = requireObject(input, "claim");
  requireId(c.id, "claim.id");
  requireString(c.text || "", "claim.text", { min: 1, max: 20000 });
  if (c.evidenceIds != null && !Array.isArray(c.evidenceIds)) {
    throw new ContractError("claim.evidenceIds must be an array.");
  }
  if (c.confidence != null && (!Number.isFinite(c.confidence) || c.confidence < 0 || c.confidence > 1)) {
    throw new ContractError("claim.confidence must be in [0,1].");
  }
  return c;
}

export function validateAction(input) {
  const a = requireObject(input, "action");
  requireId(a.id, "action.id");
  requireString(a.title || a.id, "action.title", { min: 1, max: 1000 });
  if (a.executor != null) requireId(a.executor, "action.executor");
  if (a.effect != null && !["none","read","write","external","financial","publish"].includes(a.effect)) {
    throw new ContractError("Unsupported action.effect: " + a.effect);
  }
  return a;
}

export function validateTask(input) {
  const t = requireObject(input, "task");
  requireId(t.id, "task.id");
  requireString(t.title || t.id, "task.title", { min: 1, max: 1000 });
  if (t.dependsOn != null && !Array.isArray(t.dependsOn)) throw new ContractError("task.dependsOn must be an array.");
  for (const dep of t.dependsOn || []) requireId(dep, "task.dependsOn[]");
  return t;
}

export function validateTaskDag(tasks, { maxTasks = 24 } = {}) {
  if (!Array.isArray(tasks)) throw new ContractError("tasks must be an array.");
  if (tasks.length > maxTasks) throw new ContractError("Task count exceeds policy maximum.", { maxTasks });
  const ids = new Set();
  for (const task of tasks) {
    validateTask(task);
    if (ids.has(task.id)) throw new ContractError("Duplicate task id: " + task.id);
    ids.add(task.id);
  }
  for (const task of tasks) {
    for (const dep of task.dependsOn || []) {
      if (!ids.has(dep)) throw new ContractError("Unknown dependency " + dep + " for task " + task.id);
      if (dep === task.id) throw new ContractError("Task cannot depend on itself: " + task.id);
    }
  }
  const visiting = new Set();
  const visited = new Set();
  const byId = new Map(tasks.map(t => [t.id, t]));
  function visit(id) {
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new ContractError("Task DAG contains a cycle at " + id);
    visiting.add(id);
    for (const dep of byId.get(id).dependsOn || []) visit(dep);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of ids) visit(id);
  return tasks;
}

export function validatePlannerOutput(plan, options = {}) {
  requireObject(plan, "planner output");
  validateTaskDag(plan.tasks || [], options);
  for (const task of plan.tasks || []) {
    requireString(task.workerSlot || "", "task.workerSlot", { min: 1, max: 128 });
  }
  return plan;
}

export function validateVerifierOutput(output) {
  requireObject(output, "verifier output");
  if (!Array.isArray(output.evidence || [])) throw new ContractError("verifier.evidence must be an array.");
  if (!Array.isArray(output.claims || [])) throw new ContractError("verifier.claims must be an array.");
  if (!Array.isArray(output.proposedActions || [])) throw new ContractError("verifier.proposedActions must be an array.");
  for (const e of output.evidence || []) validateEvidence(e);
  for (const c of output.claims || []) validateClaim(c);
  for (const a of output.proposedActions || []) validateAction(a);
  return output;
}


export function validateWorkerOutput(output) {
  requireObject(output, "worker output");
  if (output.summary != null) requireString(output.summary, "worker.summary", { min: 1, max: 30000 });
  if (!Array.isArray(output.evidence || [])) throw new ContractError("worker.evidence must be an array.");
  if (!Array.isArray(output.claims || [])) throw new ContractError("worker.claims must be an array.");
  if (!Array.isArray(output.proposedActions || [])) throw new ContractError("worker.proposedActions must be an array.");
  for (const e of output.evidence || []) validateEvidence(e);
  for (const claim of output.claims || []) validateClaim(claim);
  for (const action of output.proposedActions || []) validateAction(action);
  return output;
}

export function validateReviewOutput(output, knownClaimIds = []) {
  requireObject(output, "review output");
  if (output.summary != null) requireString(output.summary, "review.summary", { min: 1, max: 30000 });
  if (!Array.isArray(output.reviews || [])) throw new ContractError("review.reviews must be an array.");
  if (!Array.isArray(output.proposedActions || [])) throw new ContractError("review.proposedActions must be an array.");
  const known = new Set(knownClaimIds);
  for (const review of output.reviews || []) {
    requireObject(review, "review item");
    requireId(review.claimId, "review.claimId");
    if (!known.has(review.claimId)) throw new ContractError("Review references unknown claim: " + review.claimId);
    if (review.contradictions != null && !Array.isArray(review.contradictions)) {
      throw new ContractError("review.contradictions must be an array.");
    }
    if (review.identifiability != null && !["I0","I1","I2","I3"].includes(review.identifiability)) {
      throw new ContractError("review.identifiability must be I0-I3.");
    }
  }
  for (const action of output.proposedActions || []) validateAction(action);
  return output;
}
