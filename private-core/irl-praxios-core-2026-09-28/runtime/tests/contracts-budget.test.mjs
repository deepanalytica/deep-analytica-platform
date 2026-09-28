import test from "node:test";
import assert from "node:assert/strict";
import {
  ContractError,
  validateTaskDag,
  validateWorkerOutput,
  validateReviewOutput
} from "../core/contracts.mjs";
import { ExecutionBudget, BudgetExceededError } from "../core/budget.mjs";

test("task DAG validator accepts a valid acyclic plan", () => {
  const tasks = [
    { id: "A", title: "A", workerSlot: "research", dependsOn: [] },
    { id: "B", title: "B", workerSlot: "math", dependsOn: ["A"] }
  ];
  assert.equal(validateTaskDag(tasks).length, 2);
});

test("task DAG validator rejects cycles", () => {
  assert.throws(() => validateTaskDag([
    { id: "A", title: "A", dependsOn: ["B"] },
    { id: "B", title: "B", dependsOn: ["A"] }
  ]), ContractError);
});

test("task DAG validator rejects missing dependencies", () => {
  assert.throws(() => validateTaskDag([
    { id: "A", title: "A", dependsOn: ["MISSING"] }
  ]), /Unknown dependency/);
});

test("worker output contract enforces evidence and claim arrays", () => {
  assert.throws(() => validateWorkerOutput({
    summary: "x",
    evidence: "not-array",
    claims: [],
    proposedActions: []
  }), ContractError);
});

test("review output cannot reference an unknown claim", () => {
  assert.throws(() => validateReviewOutput({
    summary: "review",
    reviews: [{ claimId: "UNKNOWN" }],
    proposedActions: []
  }, ["C1"]), /unknown claim/i);
});

test("execution budget blocks excess provider calls", () => {
  const budget = new ExecutionBudget({
    maxProviderCalls: 1,
    maxTasks: 4,
    maxInputChars: 1000,
    maxWallClockMs: 10000
  });
  budget.registerProviderCall("a");
  assert.throws(() => budget.registerProviderCall("b"), BudgetExceededError);
});

test("execution budget blocks excess task count", () => {
  const budget = new ExecutionBudget({
    maxProviderCalls: 10,
    maxTasks: 1,
    maxInputChars: 1000,
    maxWallClockMs: 10000
  });
  assert.throws(() => budget.registerTasks(2), BudgetExceededError);
});


test("execution budget blocks excess provider output", () => {
  const budget = new ExecutionBudget({
    maxProviderCalls: 10,
    maxTasks: 4,
    maxInputChars: 1000,
    maxOutputChars: 3,
    maxWallClockMs: 10000
  });
  assert.throws(() => budget.registerProviderOutput("four"), BudgetExceededError);
});
