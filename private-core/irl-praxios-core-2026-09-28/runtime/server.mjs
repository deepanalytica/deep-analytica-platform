import http from "node:http";
import crypto from "node:crypto";
import { URL } from "node:url";
import { PraxiosRuntime } from "./core/praxios-runtime.mjs";
import { PraxiosOrchestrator, ProviderRegistry } from "./core/orchestrator.mjs";
import { ContractError } from "./core/contracts.mjs";
import { BudgetExceededError } from "./core/budget.mjs";
import { OpenAIProvider } from "./providers/openai.mjs";
import { AnthropicProvider } from "./providers/anthropic.mjs";
import { FileSessionStore } from "./storage/file-store.mjs";
import { EncryptedFileSessionStore } from "./storage/encrypted-file-store.mjs";

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";
const SERVER_TOKEN = process.env.PRAXIOS_SERVER_TOKEN || "";
const HUMAN_TOKEN = process.env.PRAXIOS_HUMAN_TOKEN || "";
const DATA_KEY = process.env.PRAXIOS_DATA_KEY || "";
const MAX_BODY_BYTES = Number(process.env.PRAXIOS_MAX_BODY_BYTES || 1_000_000);
const RATE_LIMIT_PER_MINUTE = Number(process.env.PRAXIOS_RATE_LIMIT_PER_MINUTE || 120);
const CORS_ORIGINS = new Set(
  (process.env.PRAXIOS_CORS_ORIGIN || "http://127.0.0.1:8000")
    .split(",")
    .map(x => x.trim())
    .filter(Boolean)
);

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);
const remoteBinding = !LOCAL_HOSTS.has(HOST);

if (remoteBinding && !SERVER_TOKEN) {
  throw new Error("PRAXIOS_SERVER_TOKEN is required when binding outside localhost.");
}
if (remoteBinding && !HUMAN_TOKEN) {
  throw new Error("PRAXIOS_HUMAN_TOKEN is required when binding outside localhost.");
}
if (remoteBinding && !DATA_KEY) {
  throw new Error("PRAXIOS_DATA_KEY is required when binding outside localhost.");
}

const providers = new ProviderRegistry();

if (process.env.OPENAI_API_KEY) {
  providers.register("openai", new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: process.env.PRAXIOS_OPENAI_MODEL || null
  }), {
    type: "llm",
    configured: true
  });
}

if (process.env.ANTHROPIC_API_KEY) {
  providers.register("anthropic", new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultModel: process.env.PRAXIOS_ANTHROPIC_MODEL || null
  }), {
    type: "llm",
    configured: true
  });
}

const sessions = new Map();
const store = DATA_KEY
  ? new EncryptedFileSessionStore({ key: DATA_KEY })
  : new FileSessionStore();

const rateBuckets = new Map();

function requestId() {
  return crypto.randomUUID();
}

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  return CORS_ORIGINS.has(origin);
}

function responseHeaders(req) {
  const headers = {
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "x-praxios-request-id": req.praxiosRequestId || ""
  };
  const origin = req.headers.origin;
  if (origin && CORS_ORIGINS.has(origin)) {
    headers["access-control-allow-origin"] = origin;
    headers["vary"] = "Origin";
    headers["access-control-allow-headers"] = "content-type, authorization, x-praxios-human-authorization";
    headers["access-control-allow-methods"] = "GET,POST,OPTIONS";
  }
  return headers;
}

function json(req, res, status, body) {
  const payload = status === 204 ? "" : JSON.stringify(body);
  res.writeHead(status, {
    ...responseHeaders(req),
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload)
  });
  res.end(payload);
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error("Request body exceeds configured limit.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Invalid JSON request body.");
    error.statusCode = 400;
    throw error;
  }
}

function attachBuiltins(runtime) {
  runtime.registerExecutor(
    "echo",
    async action => ({ echoed: action.payload ?? null }),
    {
      effect: "none",
      riskClass: "low",
      description: "Returns the supplied payload without an external side effect."
    }
  );

  runtime.registerExecutor(
    "measurement-design",
    async action => ({
      artifactId: "artifact-" + Date.now(),
      type: "measurement-design",
      payload: action.payload ?? null
    }),
    {
      effect: "write",
      tags: ["artifact_write"],
      riskClass: "standard",
      description: "Creates a versioned measurement-design artifact."
    }
  );
  return runtime;
}

async function persist(runtime) {
  await store.save(runtime.snapshot());
}

async function getRuntime(id) {
  if (sessions.has(id)) return sessions.get(id);
  if (await store.has(id)) {
    const snapshot = await store.load(id);
    const runtime = attachBuiltins(await PraxiosRuntime.fromSnapshot(snapshot));
    const audit = await runtime.audit();
    if (!audit.ok) {
      const error = new Error("Persisted session failed audit and was not loaded.");
      error.statusCode = 409;
      throw error;
    }
    sessions.set(id, runtime);
    return runtime;
  }
  const error = new Error("Unknown session: " + id);
  error.statusCode = 404;
  throw error;
}

function configuredProviders() {
  return providers.list();
}

function authorized(req) {
  if (!SERVER_TOKEN) return true;
  const prefix = "Bearer ";
  const header = req.headers.authorization || "";
  if (!header.startsWith(prefix)) return false;
  const supplied = Buffer.from(header.slice(prefix.length));
  const expected = Buffer.from(SERVER_TOKEN);
  if (supplied.length !== expected.length) return false;
  return crypto.timingSafeEqual(supplied, expected);
}

function humanAuthorized(req) {
  if (!HUMAN_TOKEN) return LOCAL_HOSTS.has(HOST);
  const header = String(req.headers["x-praxios-human-authorization"] || "");
  const supplied = Buffer.from(header);
  const expected = Buffer.from(HUMAN_TOKEN);
  if (supplied.length !== expected.length) return false;
  return crypto.timingSafeEqual(supplied, expected);
}

function rateLimit(req) {
  const key = req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= 60_000) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return { ok: true, remaining: RATE_LIMIT_PER_MINUTE - 1 };
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_PER_MINUTE) {
    return { ok: false, remaining: 0, resetMs: 60_000 - (now - bucket.startedAt) };
  }
  return { ok: true, remaining: RATE_LIMIT_PER_MINUTE - bucket.count };
}

async function handle(req, res) {
  req.praxiosRequestId = requestId();

  if (!originAllowed(req)) {
    return json(req, res, 403, { error: "origin_not_allowed", requestId: req.praxiosRequestId });
  }

  if (req.method === "OPTIONS") return json(req, res, 204, {});

  const limit = rateLimit(req);
  if (!limit.ok) {
    return json(req, res, 429, {
      error: "rate_limited",
      resetMs: limit.resetMs,
      requestId: req.praxiosRequestId
    });
  }

  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  const path = url.pathname;

  if (req.method === "GET" && path === "/api/health") {
    return json(req, res, 200, {
      ok: true,
      service: "praxios-runtime",
      version: "0.2.0",
      providers: configuredProviders(),
      authRequired: Boolean(SERVER_TOKEN),
      separateHumanAuthority: Boolean(HUMAN_TOKEN),
      encryptedPersistence: Boolean(DATA_KEY),
      requestId: req.praxiosRequestId
    });
  }

  if (!authorized(req)) {
    return json(req, res, 401, { error: "unauthorized", requestId: req.praxiosRequestId });
  }

  if (req.method === "GET" && path === "/api/providers") {
    return json(req, res, 200, {
      providers: configuredProviders(),
      requestId: req.praxiosRequestId
    });
  }

  if (req.method === "POST" && path === "/api/sessions") {
    const body = await readJson(req);
    const runtime = attachBuiltins(new PraxiosRuntime({ sessionId: body.sessionId }));
    await runtime.start(body.goal, body.actor || "human");
    sessions.set(runtime.sessionId, runtime);
    await persist(runtime);
    return json(req, res, 201, runtime.snapshot());
  }

  const sessionMatch = path.match(/^\/api\/sessions\/([^/]+)$/);
  if (req.method === "GET" && sessionMatch) {
    return json(req, res, 200, (await getRuntime(sessionMatch[1])).snapshot());
  }

  const evidenceMatch = path.match(/^\/api\/sessions\/([^/]+)\/evidence$/);
  if (req.method === "POST" && evidenceMatch) {
    const runtime = await getRuntime(evidenceMatch[1]);
    const body = await readJson(req);
    const evidence = await runtime.addEvidence(body.evidence, body.actor || "human");
    await persist(runtime);
    return json(req, res, 201, { evidence, snapshot: runtime.snapshot() });
  }

  const claimMatch = path.match(/^\/api\/sessions\/([^/]+)\/claims$/);
  if (req.method === "POST" && claimMatch) {
    const runtime = await getRuntime(claimMatch[1]);
    const body = await readJson(req);
    const claim = await runtime.proposeClaim(body.claim, body.actor || "proposer");
    await persist(runtime);
    return json(req, res, 201, { claim, snapshot: runtime.snapshot() });
  }

  const reviewMatch = path.match(/^\/api\/sessions\/([^/]+)\/claims\/([^/]+)\/review$/);
  if (req.method === "POST" && reviewMatch) {
    const runtime = await getRuntime(reviewMatch[1]);
    const body = await readJson(req);
    const review = await runtime.applyClaimReview(reviewMatch[2], body.review || {}, {
      verifierId: body.verifierId,
      verifierModel: body.verifierModel || null,
      actor: body.actor || body.verifierId
    });
    await persist(runtime);
    return json(req, res, 200, { review, snapshot: runtime.snapshot() });
  }

  const verifyMatch = path.match(/^\/api\/sessions\/([^/]+)\/claims\/([^/]+)\/verify$/);
  if (req.method === "POST" && verifyMatch) {
    const runtime = await getRuntime(verifyMatch[1]);
    const body = await readJson(req);
    const evaluation = await runtime.verifyClaim(verifyMatch[2], {
      verifierId: body.verifierId || "verifier",
      verifierModel: body.verifierModel || null,
      actor: body.actor || body.verifierId || "verifier"
    });
    await persist(runtime);
    return json(req, res, 200, { evaluation, snapshot: runtime.snapshot() });
  }

  const authorizationRequestMatch = path.match(/^\/api\/sessions\/([^/]+)\/authorizations$/);
  if (req.method === "POST" && authorizationRequestMatch) {
    const runtime = await getRuntime(authorizationRequestMatch[1]);
    const body = await readJson(req);
    let request;
    try {
      request = await runtime.requestAuthorization(body.action, body.actor || "proposer");
    } finally {
      await persist(runtime);
    }
    return json(req, res, 201, { request, snapshot: runtime.snapshot() });
  }

  const authorizationDecisionMatch = path.match(/^\/api\/sessions\/([^/]+)\/authorizations\/([^/]+)$/);
  if (req.method === "POST" && authorizationDecisionMatch) {
    if (!humanAuthorized(req)) {
      return json(req, res, 403, { error: "human_authority_required", requestId: req.praxiosRequestId });
    }
    const runtime = await getRuntime(authorizationDecisionMatch[1]);
    const body = await readJson(req);
    const authorization = await runtime.authorize(authorizationDecisionMatch[2], {
      approved: Boolean(body.approved),
      actor: body.actor || "human",
      authorityType: "human",
      reason: body.reason || ""
    });
    await persist(runtime);
    return json(req, res, 200, { authorization, snapshot: runtime.snapshot() });
  }

  const executeMatch = path.match(/^\/api\/sessions\/([^/]+)\/actions\/execute$/);
  if (req.method === "POST" && executeMatch) {
    const runtime = await getRuntime(executeMatch[1]);
    const body = await readJson(req);
    let result;
    try {
      result = await runtime.executeAction(body.action, {
        authorizationId: body.authorizationId || null,
        actor: body.actor || "praxios"
      });
    } finally {
      await persist(runtime);
    }
    return json(req, res, 200, { result, snapshot: runtime.snapshot() });
  }

  const decisionMatch = path.match(/^\/api\/sessions\/([^/]+)\/decisions\/([^/]+)\/select$/);
  if (req.method === "POST" && decisionMatch) {
    if (!humanAuthorized(req)) {
      return json(req, res, 403, { error: "human_authority_required", requestId: req.praxiosRequestId });
    }
    const runtime = await getRuntime(decisionMatch[1]);
    const body = await readJson(req);
    const decision = await runtime.selectDecision(decisionMatch[2], body.selectedOptionId, {
      actor: body.actor || "human",
      authorityType: "human",
      rationale: body.rationale || ""
    });
    await persist(runtime);
    return json(req, res, 200, { decision, snapshot: runtime.snapshot() });
  }

  const auditMatch = path.match(/^\/api\/sessions\/([^/]+)\/audit$/);
  if (req.method === "GET" && auditMatch) {
    const runtime = await getRuntime(auditMatch[1]);
    return json(req, res, 200, await runtime.audit());
  }

  if (req.method === "POST" && path === "/api/orchestrate") {
    const body = await readJson(req);
    if (!body.goal) return json(req, res, 400, { error: "goal_required", requestId: req.praxiosRequestId });

    const runtime = attachBuiltins(new PraxiosRuntime({ sessionId: body.sessionId }));
    sessions.set(runtime.sessionId, runtime);

    const orchestrator = new PraxiosOrchestrator({
      runtime,
      providers,
      budget: body.budget || {},
      providerTimeoutMs: Number(body.providerTimeoutMs || 60_000)
    });

    let result;
    try {
      result = await orchestrator.runGoal({
        goal: body.goal,
        planner: body.planner,
        workers: body.workers || {},
        verifier: body.verifier,
        actor: body.actor || "human",
        decision: body.decision || {}
      });
    } finally {
      await persist(runtime);
    }
    return json(req, res, 200, result);
  }

  return json(req, res, 404, { error: "not_found", requestId: req.praxiosRequestId });
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(error => {
    const message = String(error.message || error);
    const status =
      Number(error.statusCode) ||
      (error instanceof ContractError ? 400 : 0) ||
      (error instanceof BudgetExceededError ? 429 : 0) ||
      (/Meta-Harness blocked|blocked authorization request/i.test(message) ? 409 : 0) ||
      (/human authority/i.test(message) ? 403 : 500);

    json(req, res, status, {
      error: error.name || "Error",
      message: message.slice(0, 2000),
      details: error.details || undefined,
      requestId: req.praxiosRequestId
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log("PRAXIOS runtime listening on http://" + HOST + ":" + PORT);
  console.log("Configured providers: " + configuredProviders().map(p => p.name).join(", "));
  console.log("Encrypted persistence: " + Boolean(DATA_KEY));
});
