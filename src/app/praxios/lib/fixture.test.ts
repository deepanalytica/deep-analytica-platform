/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it } from "vitest";
import { fixtureRuntime } from "./fixture";

describe("PRAXIOS Web OS fixture lifecycle", () => {
  beforeEach(() => {
    fixtureRuntime.reset();
  });

  it("keeps synthetic evidence review-bound and preserves audit integrity", () => {
    let snapshot = fixtureRuntime.createSession("Evaluate a bounded technical claim.");

    const evidence = fixtureRuntime.addEvidence(snapshot.state.sessionId, {
      kind: "synthetic",
      summary: "Synthetic test evidence.",
      sourceTitle: "Fixture",
      uncertainty: "Not an independent Outside.",
    });
    snapshot = evidence.snapshot;

    const claim = fixtureRuntime.addClaim(snapshot.state.sessionId, {
      text: "The claim should not ascend without an independent Outside.",
      epistemic: "HYPOTHESIS",
      evidenceIds: [evidence.evidence.id],
      uncertainty: "Independent evidence is absent.",
      identifiability: "I0",
      requestedUse: "internal",
      requireIndependentReview: true,
    });
    snapshot = claim.snapshot;

    snapshot = fixtureRuntime.reviewClaim(
      snapshot.state.sessionId,
      claim.claim.id,
      "Independent reviewer confirms the evidence remains synthetic.",
    );

    const verified = fixtureRuntime.verifyClaim(snapshot.state.sessionId, claim.claim.id);
    snapshot = verified.snapshot;

    const evaluated = snapshot.state.claims.find((item) => item.id === claim.claim.id);
    expect(evaluated?.verdict).toBe("REVIEW");
    expect(evaluated?.gates.find((gate) => gate.id === "OUTSIDE")?.status).toBe("REVIEW");

    const audit = fixtureRuntime.audit(snapshot.state.sessionId);
    expect(audit.ok).toBe(true);
  });

  it("enforces claim-bound authorization and single-use execution", () => {
    let snapshot = fixtureRuntime.createSession("Create a bounded artifact after evidence review.");

    const evidence = fixtureRuntime.addEvidence(snapshot.state.sessionId, {
      kind: "measurement",
      summary: "Independent instrument measurement.",
      sourceTitle: "Instrument A",
      sourceUri: "https://example.invalid/instrument-a",
      uncertainty: "Calibrated test fixture.",
    });
    snapshot = evidence.snapshot;

    const claim = fixtureRuntime.addClaim(snapshot.state.sessionId, {
      text: "A bounded measurement-design artifact may be created.",
      epistemic: "DERIVED",
      evidenceIds: [evidence.evidence.id],
      method: "Fixture derivation",
      uncertainty: "Bounded to fixture semantics.",
      identifiability: "I1",
      requestedUse: "internal",
      requireIndependentReview: true,
    });
    snapshot = claim.snapshot;

    snapshot = fixtureRuntime.reviewClaim(
      snapshot.state.sessionId,
      claim.claim.id,
      "Independent review recorded.",
    );
    snapshot = fixtureRuntime.verifyClaim(snapshot.state.sessionId, claim.claim.id).snapshot;

    const evaluated = snapshot.state.claims.find((item) => item.id === claim.claim.id);
    expect(evaluated?.verdict).toBe("PASS");

    const request = fixtureRuntime.requestAuthorization(snapshot.state.sessionId, {
      title: "Create measurement design",
      executor: "measurement-design",
      effect: "write",
      payload: { purpose: "test" },
      requiredClaimIds: [claim.claim.id],
      claimThreshold: "PASS",
    });
    snapshot = request.snapshot;
    expect(request.request.status).toBe("PENDING");

    snapshot = fixtureRuntime.decideAuthorization(
      snapshot.state.sessionId,
      request.request.id,
      true,
      "Human approves exact bounded action.",
    );

    const action = snapshot.state.actions.find((item) => item.id === request.request.actionId);
    expect(action).toBeTruthy();

    const executed = fixtureRuntime.executeAction(snapshot.state.sessionId, action!.id);
    snapshot = executed.snapshot;

    const authorization = snapshot.state.authorizations.find((item) => item.id === request.request.id);
    expect(authorization?.consumed).toBe(true);
    expect(snapshot.state.artifacts.length).toBe(1);

    expect(() => fixtureRuntime.executeAction(snapshot.state.sessionId, action!.id)).toThrow(
      /unused approved authorization/i,
    );

    expect(fixtureRuntime.audit(snapshot.state.sessionId).ok).toBe(true);
  });

  it("blocks an unregistered executor before human approval", () => {
    let snapshot = fixtureRuntime.createSession("Test a structural wall.");

    const request = fixtureRuntime.requestAuthorization(snapshot.state.sessionId, {
      title: "Unsafe unknown action",
      executor: "unregistered",
      effect: "write",
      payload: {},
      requiredClaimIds: [],
      claimThreshold: "PASS",
    });

    snapshot = request.snapshot;
    expect(request.request.status).toBe("DENIED");
    expect(String(request.request.reason)).toMatch(/wall/i);
    expect(snapshot.state.authorizations[0].status).toBe("DENIED");
  });
});
