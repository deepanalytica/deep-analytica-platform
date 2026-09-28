import test from "node:test";
import assert from "node:assert/strict";
import { EventLedger } from "../core/ledger.mjs";
import { PraxiosRuntime } from "../core/praxios-runtime.mjs";
import { TaskScheduler } from "../core/scheduler.mjs";

const clock = () => "2026-09-27T00:00:00.000Z";

test("ledger detects tampering", async () => {
  const ledger = new EventLedger({ clock });
  await ledger.append("A", { value: 1 });
  await ledger.append("B", { value: 2 });
  assert.equal((await ledger.verify()).ok, true);

  const tampered = ledger.snapshot();
  tampered[0].payload.value = 99;
  const check = await ledger.verify(tampered);
  assert.equal(check.ok, false);
  assert.equal(check.reason, "hash_mismatch");
});

test("Meta-Harness blocks proposer acting as verifier", async () => {
  const runtime = new PraxiosRuntime({ sessionId: "role-test", clock });
  await runtime.start("Test role separation.");
  await runtime.addEvidence({
    id: "E1",
    kind: "published",
    summary: "Evidence",
    peerReviewed: true,
    source: { title: "Source", uri: "https://example.test/source" }
  });
  await runtime.proposeClaim({
    id: "C1",
    text: "A bounded claim.",
    epistemic: "PUBLISHED",
    evidenceIds: ["E1"],
    confidence: 0.9,
    identifiability: "I2",
    requiredIdentifiability: "I1",
    proposerId: "agent-a"
  }, "agent-a");

  const evaluation = await runtime.verifyClaim("C1", { verifierId: "agent-a", actor: "agent-a" });
  assert.equal(evaluation.verdict, "BLOCK");
  assert.equal(evaluation.gates.find(g => g.id === "ROLE_SEPARATION").status, "BLOCK");
});

test("effectful action is blocked until explicit human authorization", async () => {
  const runtime = new PraxiosRuntime({ sessionId: "auth-test", clock });
  await runtime.start("Test authorization.");
  runtime.registerExecutor(
    "write-artifact",
    async action => ({ artifactId: "A1", value: action.payload }),
    { effect: "write" }
  );

  const action = {
    id: "ACT-1",
    title: "Write approved artifact",
    executor: "write-artifact",
    payload: { ok: true }
  };

  await assert.rejects(runtime.executeAction(action), /Meta-Harness blocked action/);

  const request = await runtime.requestAuthorization(action, "planner");
  await assert.rejects(
    runtime.authorize(request.id, { approved: true, actor: "model", authorityType: "model" }),
    /human authority/
  );

  const authorization = await runtime.authorize(request.id, {
    approved: true,
    actor: "human",
    authorityType: "human",
    reason: "Approved in test."
  });
  assert.equal(authorization.status, "APPROVED");

  const result = await runtime.executeAction(action, {
    authorizationId: request.id,
    actor: "praxios"
  });
  assert.deepEqual(result.output, { artifactId: "A1", value: { ok: true } });

  await assert.rejects(
    runtime.executeAction(action, {
      authorizationId: request.id,
      actor: "praxios"
    }),
    /Meta-Harness blocked action/
  );
});

test("authorization is bound to exact action payload", async () => {
  const runtime = new PraxiosRuntime({ sessionId: "auth-binding-test", clock });
  await runtime.start("Test action binding.");
  runtime.registerExecutor(
    "write-artifact",
    async action => ({ ok: true, payload: action.payload }),
    { effect: "write" }
  );

  const original = {
    id: "ACT-2",
    title: "Write artifact",
    executor: "write-artifact",
    payload: { value: 1 }
  };
  const request = await runtime.requestAuthorization(original, "planner");
  await runtime.authorize(request.id, {
    approved: true,
    actor: "human",
    authorityType: "human"
  });

  const mutated = { ...original, payload: { value: 999 } };
  await assert.rejects(
    runtime.executeAction(mutated, { authorizationId: request.id }),
    /Meta-Harness blocked action/
  );
});

test("disabled executor is blocked before authorization can be requested", async () => {
  const runtime = new PraxiosRuntime({ sessionId: "wall-test", clock });
  await runtime.start("Test structural wall.");
  runtime.registerExecutor("disabled-tool", async () => ({ ok: true }), {
    effect: "write",
    enabled: false
  });

  const action = {
    id: "ACT-3",
    title: "Disabled tool",
    executor: "disabled-tool"
  };

  await assert.rejects(
    runtime.requestAuthorization(action, "planner"),
    /Meta-Harness blocked authorization request/
  );
  assert.equal(runtime.state.authorizations.length, 0);
});

test("scheduler respects dependencies deterministically", async () => {
  const scheduler = new TaskScheduler();
  scheduler.add({ id: "A", title: "A", input: "a" });
  scheduler.add({ id: "B", title: "B", input: "b", dependsOn: ["A"] });

  const order = [];
  const result = await scheduler.run(async task => {
    order.push(task.id);
    return task.id.toLowerCase();
  });

  assert.deepEqual(order, ["A", "B"]);
  assert.equal(result.find(t => t.id === "B").status, "COMPLETED");
});

test("scheduler retries only up to configured maximum", async () => {
  const scheduler = new TaskScheduler();
  scheduler.add({ id: "A", title: "A", maxAttempts: 2 });
  let calls = 0;
  const result = await scheduler.run(async () => {
    calls += 1;
    throw new Error("failure");
  });
  assert.equal(calls, 2);
  assert.equal(result[0].status, "FAILED");
});

test("publication claim is blocked when identifiability is too low", async () => {
  const runtime = new PraxiosRuntime({ sessionId: "publish-test", clock });
  await runtime.start("Test publication gate.");
  await runtime.addEvidence({
    id: "E1",
    kind: "published",
    summary: "Constraint",
    source: { title: "Paper", uri: "https://example.test/paper" },
    peerReviewed: true
  });
  await runtime.proposeClaim({
    id: "C2",
    text: "Specific mechanism caused the observed state.",
    epistemic: "HYPOTHESIS",
    evidenceIds: ["E1"],
    method: "inverse inference",
    uncertainty: "Several alternative mechanisms remain.",
    identifiability: "I1",
    requiredIdentifiability: "I2",
    requestedUse: "publish",
    proposerId: "proposer"
  }, "proposer");

  const evaluation = await runtime.verifyClaim("C2", {
    verifierId: "independent-verifier"
  });
  assert.equal(evaluation.verdict, "BLOCK");
  assert.equal(evaluation.gates.find(g => g.id === "IDENTIFIABILITY").status, "BLOCK");
});

test("independent-review claims require recorded verifier coverage", async () => {
  const runtime = new PraxiosRuntime({ sessionId: "review-coverage", clock });
  await runtime.start("Test review coverage.");
  await runtime.addEvidence({
    id: "E1",
    kind: "published",
    summary: "Constraint",
    source: { title: "Paper", uri: "https://example.test/paper" },
    peerReviewed: true
  });
  await runtime.proposeClaim({
    id: "C3",
    text: "A derived claim.",
    epistemic: "DERIVED",
    evidenceIds: ["E1"],
    method: "calculation",
    uncertainty: "Bounded numerical error.",
    identifiability: "I2",
    requiredIdentifiability: "I1",
    proposerId: "worker-a",
    proposerModel: { provider: "p1", model: "m1" },
    requireIndependentReview: true
  }, "worker-a");

  let evaluation = await runtime.verifyClaim("C3", {
    verifierId: "reviewer-b",
    verifierModel: { provider: "p2", model: "m2" }
  });
  assert.equal(evaluation.verdict, "BLOCK");
  assert.equal(evaluation.gates.find(g => g.id === "REVIEW_COVERAGE").status, "BLOCK");

  await runtime.applyClaimReview("C3", {
    summary: "Reviewed.",
    contradictions: [],
    identifiability: "I2"
  }, {
    verifierId: "reviewer-b",
    verifierModel: { provider: "p2", model: "m2" }
  });

  evaluation = await runtime.verifyClaim("C3", {
    verifierId: "reviewer-b",
    verifierModel: { provider: "p2", model: "m2" }
  });
  assert.equal(evaluation.gates.find(g => g.id === "REVIEW_COVERAGE").status, "PASS");
  assert.equal(evaluation.gates.find(g => g.id === "MODEL_INDEPENDENCE").status, "PASS");
});

test("same provider/model reviewer is surfaced as weaker independence", async () => {
  const runtime = new PraxiosRuntime({ sessionId: "model-independence", clock });
  await runtime.start("Test model independence.");
  await runtime.addEvidence({
    id: "E1",
    kind: "published",
    summary: "Constraint",
    source: { title: "Paper", uri: "https://example.test/paper" }
  });
  await runtime.proposeClaim({
    id: "C4",
    text: "A derived claim.",
    epistemic: "DERIVED",
    evidenceIds: ["E1"],
    method: "calculation",
    uncertainty: "Known uncertainty.",
    identifiability: "I2",
    proposerId: "worker-a",
    proposerModel: { provider: "p1", model: "m1" },
    requireIndependentReview: true
  }, "worker-a");
  await runtime.applyClaimReview("C4", { summary: "Reviewed.", contradictions: [] }, {
    verifierId: "worker-b",
    verifierModel: { provider: "p1", model: "m1" }
  });
  const evaluation = await runtime.verifyClaim("C4", {
    verifierId: "worker-b",
    verifierModel: { provider: "p1", model: "m1" }
  });
  assert.equal(evaluation.gates.find(g => g.id === "MODEL_INDEPENDENCE").status, "REVIEW");
});

test("Decision Room prevents options that depend on non-PASS claims", async () => {
  const runtime = new PraxiosRuntime({ sessionId: "decision-room", clock });
  await runtime.start("Test decision room.");
  await runtime.proposeClaim({
    id: "C5",
    text: "Uncertain claim.",
    epistemic: "HYPOTHESIS",
    evidenceIds: [],
    method: "inference",
    uncertainty: "Large.",
    identifiability: "I0",
    proposerId: "worker"
  }, "worker");
  runtime.state.claims[0].verdict = "REVIEW";

  const pkg = await runtime.createDecisionPackage({
    id: "DR-1",
    title: "Decision",
    situation: "Choose",
    options: [
      { id: "unsafe", label: "Act as fact", requiresClaimIds: ["C5"] },
      { id: "hold", label: "Hold" }
    ]
  });

  await assert.rejects(
    runtime.selectDecision(pkg.id, "unsafe", {
      actor: "human",
      authorityType: "human"
    }),
    /have not passed Meta-Harness/
  );

  const selected = await runtime.selectDecision(pkg.id, "hold", {
    actor: "human",
    authorityType: "human",
    rationale: "Need more evidence."
  });
  assert.equal(selected.selected, "hold");
});

test("action claim dependency can require PASS", async () => {
  const runtime = new PraxiosRuntime({ sessionId: "claim-action", clock });
  await runtime.start("Test action claim dependency.");
  runtime.registerExecutor("write-artifact", async () => ({ ok: true }), { effect: "write" });
  runtime.state.claims.push({ id: "C6", verdict: "REVIEW" });

  await assert.rejects(
    runtime.requestAuthorization({
      id: "ACT-6",
      title: "Act on claim",
      executor: "write-artifact",
      requiredClaimIds: ["C6"],
      claimThreshold: "PASS"
    }),
    /blocked authorization request/
  );
});


test("unregistered executor is a structural wall", async () => {
  const runtime = new PraxiosRuntime({ sessionId: "unregistered-executor", clock });
  await runtime.start("Test unregistered executor.");
  await assert.rejects(
    runtime.requestAuthorization({
      id: "ACT-U1",
      title: "Unknown executor",
      executor: "not-registered"
    }),
    /blocked authorization request/
  );
});

test("executor failure consumes authorization and records failure", async () => {
  const runtime = new PraxiosRuntime({ sessionId: "executor-failure", clock });
  await runtime.start("Test executor failure.");
  runtime.registerExecutor("failing-tool", async () => {
    throw new Error("tool failed");
  }, { effect: "write" });

  const action = {
    id: "ACT-F1",
    title: "Failing action",
    executor: "failing-tool"
  };
  const request = await runtime.requestAuthorization(action, "planner");
  await runtime.authorize(request.id, {
    approved: true,
    actor: "human",
    authorityType: "human"
  });

  await assert.rejects(
    runtime.executeAction(action, { authorizationId: request.id }),
    /tool failed/
  );

  const authorization = runtime.state.authorizations.find(a => a.id === request.id);
  const storedAction = runtime.state.actions.find(a => a.id === action.id);
  assert.equal(authorization.consumed, true);
  assert.equal(storedAction.status, "FAILED");
  assert.ok(runtime.ledger.snapshot().some(e => e.type === "ACTION_EXECUTION_FAILED"));
});
