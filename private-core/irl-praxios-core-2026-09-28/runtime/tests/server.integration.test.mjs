import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { spawn } from "node:child_process";

async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(error => error ? reject(error) : resolve(port));
    });
  });
}

async function waitForHealth(baseUrl, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(baseUrl + "/api/health");
      if (response.ok) return response.json();
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Server did not become healthy.");
}

test("server enforces auth and executes an approved action end-to-end", { timeout: 20000 }, async () => {
  const port = await freePort();
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "praxios-server-"));
  const token = "test-token-" + crypto.randomBytes(12).toString("hex");
  const humanToken = "human-token-" + crypto.randomBytes(12).toString("hex");
  const dataKey = crypto.randomBytes(32).toString("base64");
  const serverPath = path.resolve("runtime/server.mjs");

  const child = spawn(process.execPath, [serverPath], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      PRAXIOS_SERVER_TOKEN: token,
      PRAXIOS_HUMAN_TOKEN: humanToken,
      PRAXIOS_DATA_KEY: dataKey,
      PRAXIOS_DATA_DIR: directory,
      PRAXIOS_CORS_ORIGIN: "https://example.test"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  const baseUrl = "http://127.0.0.1:" + port;
  const auth = { authorization: "Bearer " + token, "content-type": "application/json" };

  try {
    const health = await waitForHealth(baseUrl);
    assert.equal(health.ok, true);
    assert.equal(health.encryptedPersistence, true);

    const unauth = await fetch(baseUrl + "/api/providers");
    assert.equal(unauth.status, 401);

    const created = await fetch(baseUrl + "/api/sessions", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ sessionId: "integration-session", goal: "Integration test" })
    });
    assert.equal(created.status, 201);

    const authRequestResponse = await fetch(baseUrl + "/api/sessions/integration-session/authorizations", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({
        action: {
          id: "ACT-I1",
          title: "Create test measurement artifact",
          executor: "measurement-design",
          payload: { value: 1 }
        }
      })
    });
    assert.equal(authRequestResponse.status, 201);
    const authRequest = await authRequestResponse.json();

    const machineOnlyApproval = await fetch(
      baseUrl + "/api/sessions/integration-session/authorizations/" + authRequest.request.id,
      {
        method: "POST",
        headers: auth,
        body: JSON.stringify({ approved: true, actor: "machine" })
      }
    );
    assert.equal(machineOnlyApproval.status, 403);

    const approve = await fetch(
      baseUrl + "/api/sessions/integration-session/authorizations/" + authRequest.request.id,
      {
        method: "POST",
        headers: { ...auth, "x-praxios-human-authorization": humanToken },
        body: JSON.stringify({ approved: true, actor: "integration-human" })
      }
    );
    assert.equal(approve.status, 200);

    const execute = await fetch(baseUrl + "/api/sessions/integration-session/actions/execute", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({
        action: authRequest.request.action,
        authorizationId: authRequest.request.id
      })
    });
    assert.equal(execute.status, 200);
    const executed = await execute.json();
    assert.equal(executed.result.output.type, "measurement-design");

    const replay = await fetch(baseUrl + "/api/sessions/integration-session/actions/execute", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({
        action: authRequest.request.action,
        authorizationId: authRequest.request.id
      })
    });
    assert.notEqual(replay.status, 200);

    const audit = await fetch(baseUrl + "/api/sessions/integration-session/audit", {
      headers: { authorization: "Bearer " + token }
    });
    assert.equal(audit.status, 200);
    const auditBody = await audit.json();
    assert.equal(auditBody.ok, true);

    const files = await fs.readdir(directory);
    assert.ok(files.some(name => name.endsWith(".enc.json")));
  } finally {
    child.kill("SIGTERM");
    await new Promise(resolve => {
      const timer = setTimeout(resolve, 1000);
      child.once("exit", () => {
        clearTimeout(timer);
        resolve();
      });
    });
    await fs.rm(directory, { recursive: true, force: true });
  }
});
