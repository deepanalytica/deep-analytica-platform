import { NextRequest, NextResponse } from "next/server";

const RUNTIME_URL = (process.env.PRAXIOS_RUNTIME_URL || "").replace(/\/$/, "");
const SERVER_TOKEN = process.env.PRAXIOS_RUNTIME_TOKEN || "";
const HUMAN_TOKEN = process.env.PRAXIOS_HUMAN_TOKEN || "";
const APP_ADMIN_TOKEN = process.env.PRAXIOS_APP_ADMIN_TOKEN || "";

function isHumanAuthorityPath(path: string) {
  return /\/authorizations\/[^/]+$/.test(path) || /\/decisions\/[^/]+\/select$/.test(path);
}

function json(status: number, body: unknown) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function proxy(request: NextRequest, segments: string[]) {
  if (!RUNTIME_URL) {
    if (segments.join("/") === "health") {
      return json(200, {
        ok: false,
        mode: "unconfigured",
        service: "praxios-runtime-gateway",
        error: "PRAXIOS_RUNTIME_URL is not configured.",
      });
    }
    return json(503, {
      error: "runtime_unconfigured",
      message: "Remote PRAXIOS runtime is not configured. Use Local Fixture mode or configure PRAXIOS_RUNTIME_URL.",
    });
  }

  const path = segments.join("/");
  const targetPath = path === "health" ? "/api/health" : "/api/" + path;
  const headers = new Headers();
  headers.set("accept", "application/json");
  if (SERVER_TOKEN) headers.set("authorization", "Bearer " + SERVER_TOKEN);

  const humanPath = isHumanAuthorityPath("/" + path);
  if (humanPath) {
    const supplied = request.headers.get("x-praxios-app-admin-token") || "";
    if (!APP_ADMIN_TOKEN || supplied !== APP_ADMIN_TOKEN) {
      return json(403, {
        error: "app_admin_authority_required",
        message: "A valid PRAXIOS app-admin token is required for human-authority operations.",
      });
    }
    if (!HUMAN_TOKEN) {
      return json(503, {
        error: "human_authority_unconfigured",
        message: "PRAXIOS_HUMAN_TOKEN is not configured on the server.",
      });
    }
    headers.set("x-praxios-human-authorization", HUMAN_TOKEN);
  }

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
    if (body) headers.set("content-type", request.headers.get("content-type") || "application/json");
  }

  try {
    const response = await fetch(RUNTIME_URL + targetPath, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(65_000),
    });
    const contentType = response.headers.get("content-type") || "application/json";
    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "content-type": contentType,
        "cache-control": "no-store",
        "x-praxios-gateway": "1",
      },
    });
  } catch (error) {
    return json(502, {
      error: "runtime_unreachable",
      message: error instanceof Error ? error.message : "Remote runtime request failed.",
    });
  }
}

type Context = { params: { path: string[] } };

export async function GET(request: NextRequest, context: Context) {
  return proxy(request, context.params.path || []);
}

export async function POST(request: NextRequest, context: Context) {
  return proxy(request, context.params.path || []);
}
