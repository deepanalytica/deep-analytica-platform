import type {
  Action,
  AuditResult,
  CreateActionInput,
  CreateClaimInput,
  CreateEvidenceInput,
  PraxiosSnapshot,
  RuntimeHealth,
} from "./types";

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text };
    }
  }
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof (body as { message?: unknown }).message === "string"
        ? (body as { message: string }).message
        : typeof body === "object" &&
            body !== null &&
            "error" in body &&
            typeof (body as { error?: unknown }).error === "string"
          ? (body as { error: string }).error
          : "PRAXIOS request failed.";
    throw new Error(message);
  }
  return body as T;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  appAdminToken?: string,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (appAdminToken) headers.set("x-praxios-app-admin-token", appAdminToken);
  return parseResponse<T>(
    await fetch("/api/praxios-runtime/" + path.replace(/^\/+/, ""), {
      ...init,
      headers,
      cache: "no-store",
    }),
  );
}

export const remoteRuntime = {
  health: () => request<RuntimeHealth>("health"),
  providers: () => request<{ providers: Array<Record<string, unknown>> }>("providers"),

  createSession: (goal: string) =>
    request<PraxiosSnapshot>("sessions", {
      method: "POST",
      body: JSON.stringify({ goal, actor: "human:webos" }),
    }),

  getSession: (sessionId: string) =>
    request<PraxiosSnapshot>("sessions/" + encodeURIComponent(sessionId)),

  addEvidence: (sessionId: string, input: CreateEvidenceInput) => {
    const id = "E-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    return request<{ evidence: unknown; snapshot: PraxiosSnapshot }>(
      "sessions/" + encodeURIComponent(sessionId) + "/evidence",
      {
        method: "POST",
        body: JSON.stringify({
          actor: "human:webos",
          evidence: {
            id,
            kind: input.kind || "reported",
            summary: input.summary,
            source:
              input.sourceTitle || input.sourceUri
                ? { title: input.sourceTitle || "", uri: input.sourceUri || "" }
                : null,
            peerReviewed: Boolean(input.peerReviewed),
            uncertainty: input.uncertainty || null,
            capturedAt: new Date().toISOString(),
            metadata: { ui: "praxios-webos" },
          },
        }),
      },
    );
  },

  addClaim: (sessionId: string, input: CreateClaimInput) => {
    const id = "C-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    return request<{ claim: unknown; snapshot: PraxiosSnapshot }>(
      "sessions/" + encodeURIComponent(sessionId) + "/claims",
      {
        method: "POST",
        body: JSON.stringify({
          actor: "human:proposer",
          claim: {
            id,
            text: input.text,
            epistemic: input.epistemic,
            evidenceIds: input.evidenceIds,
            method: input.method || null,
            uncertainty: input.uncertainty || null,
            confidence: input.confidence ?? null,
            identifiability: input.identifiability,
            requestedUse: input.requestedUse,
            proposerId: "human:proposer",
            requireIndependentReview: input.requireIndependentReview,
          },
        }),
      },
    );
  },

  reviewClaim: (
    sessionId: string,
    claimId: string,
    review: { summary: string; uncertainty?: string; identifiability?: string },
  ) =>
    request<{ review: unknown; snapshot: PraxiosSnapshot }>(
      "sessions/" +
        encodeURIComponent(sessionId) +
        "/claims/" +
        encodeURIComponent(claimId) +
        "/review",
      {
        method: "POST",
        body: JSON.stringify({
          verifierId: "human:independent-verifier",
          actor: "human:independent-verifier",
          review,
        }),
      },
    ),

  verifyClaim: (sessionId: string, claimId: string) =>
    request<{ evaluation: unknown; snapshot: PraxiosSnapshot }>(
      "sessions/" +
        encodeURIComponent(sessionId) +
        "/claims/" +
        encodeURIComponent(claimId) +
        "/verify",
      {
        method: "POST",
        body: JSON.stringify({
          verifierId: "human:independent-verifier",
          actor: "human:independent-verifier",
        }),
      },
    ),

  requestAuthorization: (sessionId: string, input: CreateActionInput) => {
    const action: Action = {
      id: "A-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      title: input.title,
      executor: input.executor,
      effect: input.effect,
      payload: input.payload ?? null,
      requiredClaimIds: input.requiredClaimIds || [],
      claimThreshold: input.claimThreshold || "PASS",
    };
    return request<{ request: unknown; snapshot: PraxiosSnapshot }>(
      "sessions/" + encodeURIComponent(sessionId) + "/authorizations",
      {
        method: "POST",
        body: JSON.stringify({ action, actor: "human:webos" }),
      },
    );
  },

  decideAuthorization: (
    sessionId: string,
    authorizationId: string,
    approved: boolean,
    reason: string,
    appAdminToken: string,
  ) =>
    request<{ authorization: unknown; snapshot: PraxiosSnapshot }>(
      "sessions/" +
        encodeURIComponent(sessionId) +
        "/authorizations/" +
        encodeURIComponent(authorizationId),
      {
        method: "POST",
        body: JSON.stringify({
          approved,
          reason,
          actor: "human:webos",
        }),
      },
      appAdminToken,
    ),

  executeAction: (
    sessionId: string,
    action: Action,
    authorizationId?: string | null,
  ) =>
    request<{ result: unknown; snapshot: PraxiosSnapshot }>(
      "sessions/" + encodeURIComponent(sessionId) + "/actions/execute",
      {
        method: "POST",
        body: JSON.stringify({
          action,
          authorizationId: authorizationId || null,
          actor: "praxios:webos",
        }),
      },
    ),

  selectDecision: (
    sessionId: string,
    decisionId: string,
    optionId: string,
    rationale: string,
    appAdminToken: string,
  ) =>
    request<{ decision: unknown; snapshot: PraxiosSnapshot }>(
      "sessions/" +
        encodeURIComponent(sessionId) +
        "/decisions/" +
        encodeURIComponent(decisionId) +
        "/select",
      {
        method: "POST",
        body: JSON.stringify({
          selectedOptionId: optionId,
          rationale,
          actor: "human:webos",
        }),
      },
      appAdminToken,
    ),

  audit: (sessionId: string) =>
    request<AuditResult>("sessions/" + encodeURIComponent(sessionId) + "/audit"),

  orchestrate: (body: {
    goal: string;
    planner: { provider: string; model: string };
    workers: Record<string, { provider: string; model: string }>;
    verifier: { provider: string; model: string };
    actor?: string;
    budget?: Record<string, number>;
    decision?: Record<string, unknown>;
  }) =>
    request<{
      goal: string;
      snapshot: PraxiosSnapshot;
      plan?: unknown;
      review?: unknown;
      claimEvaluations?: unknown[];
      authorizationRequests?: unknown[];
      rejectedActions?: unknown[];
      decisionPackage?: unknown;
      budget?: unknown;
    }>("orchestrate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
