import test from "node:test";
import assert from "node:assert/strict";
import { OpenAIProvider } from "../providers/openai.mjs";
import { AnthropicProvider } from "../providers/anthropic.mjs";
import { FixtureProvider } from "../providers/fixture.mjs";
import { ProviderRegistry, PraxiosOrchestrator } from "../core/orchestrator.mjs";
import { PraxiosRuntime } from "../core/praxios-runtime.mjs";

test("OpenAI adapter parses Responses API text output", async () => {
  let receivedSignal = null;
  const provider = new OpenAIProvider({
    apiKey: "test",
    defaultModel: "test-model",
    fetchImpl: async (_url, init) => {
      receivedSignal = init.signal;
      return {
        ok: true,
        json: async () => ({
          output: [{
            type: "message",
            content: [{ type: "output_text", text: "hello" }]
          }]
        })
      };
    }
  });
  assert.equal(await provider.generate({ input: "x" }), "hello");
  assert.equal(receivedSignal, undefined);
});

test("Anthropic adapter parses Messages API text output", async () => {
  const provider = new AnthropicProvider({
    apiKey: "test",
    defaultModel: "test-model",
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: "hello" }]
      })
    })
  });
  assert.equal(await provider.generate({ input: "x" }), "hello");
});

test("orchestrator separates worker claims from independent review", async () => {
  const registry = new ProviderRegistry();
  registry.register("planner-fixture", new FixtureProvider(JSON.stringify({
    tasks: [{
      id: "T1",
      title: "Research",
      role: "researcher",
      input: "Collect evidence",
      dependsOn: [],
      workerSlot: "research"
    }]
  })));

  registry.register("worker-fixture", new FixtureProvider(JSON.stringify({
    summary: "Worker complete.",
    evidence: [{
      id: "E1",
      kind: "published",
      summary: "Published constraint",
      peerReviewed: true,
      source: { title: "Paper", uri: "https://example.test/paper" }
    }],
    claims: [{
      id: "C1",
      text: "A bounded hypothesis.",
      epistemic: "HYPOTHESIS",
      evidenceIds: ["E1"],
      method: "inverse analysis",
      uncertainty: "Alternatives remain.",
      identifiability: "I1",
      requiredIdentifiability: "I1",
      contradictions: [],
      requestedUse: "decision"
    }],
    proposedActions: []
  })));

  registry.register("verifier-fixture", new FixtureProvider(JSON.stringify({
    summary: "Independent review complete.",
    reviews: [{
      claimId: "C1",
      summary: "Claim remains a hypothesis.",
      contradictions: [],
      uncertainty: "Alternatives remain.",
      identifiability: "I1"
    }],
    proposedActions: []
  })));

  const runtime = new PraxiosRuntime({
    sessionId: "orchestration-test",
    clock: () => "2026-09-27T00:00:00.000Z"
  });

  const orchestrator = new PraxiosOrchestrator({
    runtime,
    providers: registry,
    budget: { maxProviderCalls: 10, maxTasks: 4, maxInputChars: 100000, maxWallClockMs: 60000 }
  });

  const result = await orchestrator.runGoal({
    goal: "Test goal",
    planner: { provider: "planner-fixture", model: "planner" },
    workers: {
      research: { provider: "worker-fixture", model: "worker" }
    },
    verifier: { provider: "verifier-fixture", model: "verifier" }
  });

  assert.equal(result.plan.tasks.length, 1);
  assert.equal(runtime.scheduler.get("T1").status, "COMPLETED");
  assert.equal(runtime.state.claims.length, 1);
  assert.match(runtime.state.claims[0].proposerId, /^worker:/);
  assert.match(runtime.state.claims[0].verifierId, /^verifier:/);
  assert.notEqual(runtime.state.claims[0].proposerId, runtime.state.claims[0].verifierId);
  assert.equal(runtime.state.claims[0].reviews.length, 1);
  assert.equal(
    runtime.state.claims[0].gates.find(g => g.id === "REVIEW_COVERAGE").status,
    "PASS"
  );
  assert.ok(result.decisionPackage);
  assert.ok(result.budget.usage.providerCalls >= 3);
});

test("orchestrator rejects planner cycles before execution", async () => {
  const registry = new ProviderRegistry();
  registry.register("planner", new FixtureProvider(JSON.stringify({
    tasks: [
      { id: "A", title: "A", role: "worker", input: "a", dependsOn: ["B"], workerSlot: "w" },
      { id: "B", title: "B", role: "worker", input: "b", dependsOn: ["A"], workerSlot: "w" }
    ]
  })));
  registry.register("worker", new FixtureProvider(JSON.stringify({
    summary: "x", evidence: [], claims: [], proposedActions: []
  })));
  registry.register("verifier", new FixtureProvider(JSON.stringify({
    summary: "x", reviews: [], proposedActions: []
  })));

  const runtime = new PraxiosRuntime({ sessionId: "cycle-test" });
  const orchestrator = new PraxiosOrchestrator({ runtime, providers: registry });

  await assert.rejects(
    orchestrator.runGoal({
      goal: "cycle",
      planner: { provider: "planner", model: "p" },
      workers: { w: { provider: "worker", model: "w" } },
      verifier: { provider: "verifier", model: "v" }
    }),
    /cycle/
  );
});
