import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { PraxiosRuntime } from "../core/praxios-runtime.mjs";
import { FileSessionStore } from "../storage/file-store.mjs";
import { EncryptedFileSessionStore } from "../storage/encrypted-file-store.mjs";

const clock = () => "2026-09-27T00:00:00.000Z";

async function makeRuntime(id) {
  const runtime = new PraxiosRuntime({ sessionId: id, clock });
  await runtime.start("Persist a governed session.");
  await runtime.addEvidence({
    id: "E1",
    kind: "direct",
    summary: "Direct evidence",
    source: { title: "Local test", uri: "urn:test:e1" }
  });
  return runtime;
}

test("session snapshot persists and restores with ledger/state audit", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "praxios-store-"));
  try {
    const runtime = await makeRuntime("persist-test");
    const store = new FileSessionStore({ directory });
    await store.save(runtime.snapshot());
    const loaded = await store.load("persist-test");
    const restored = await PraxiosRuntime.fromSnapshot(loaded);
    const audit = await restored.audit();

    assert.equal(audit.ok, true);
    assert.equal(restored.state.goal, "Persist a governed session.");
    assert.equal(restored.state.evidence.length, 1);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test("encrypted session store does not write plaintext state", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "praxios-encrypted-"));
  try {
    const runtime = await makeRuntime("encrypted-test");
    const key = crypto.randomBytes(32).toString("base64");
    const store = new EncryptedFileSessionStore({ directory, key });
    const file = await store.save(runtime.snapshot());
    const raw = await fs.readFile(file, "utf8");

    assert.equal(raw.includes("Persist a governed session."), false);
    const loaded = await store.load("encrypted-test");
    const restored = await PraxiosRuntime.fromSnapshot(loaded);
    assert.equal((await restored.audit()).ok, true);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test("encrypted store rejects the wrong key", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "praxios-encrypted-wrong-key-"));
  try {
    const runtime = await makeRuntime("encrypted-key-test");
    const keyA = crypto.randomBytes(32).toString("base64");
    const keyB = crypto.randomBytes(32).toString("base64");
    await new EncryptedFileSessionStore({ directory, key: keyA }).save(runtime.snapshot());
    await assert.rejects(
      new EncryptedFileSessionStore({ directory, key: keyB }).load("encrypted-key-test")
    );
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
