const encoder = new TextEncoder();

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = sortValue(value[key]);
    return out;
  }
  return value;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(sortValue(value));
}

export async function sha256Hex(text) {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", encoder.encode(text));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

export class EventLedger {
  constructor({ clock = () => new Date().toISOString(), seed = "GENESIS" } = {}) {
    this.clock = clock;
    this.seed = seed;
    this.events = [];
  }

  get lastHash() {
    return this.events.length ? this.events[this.events.length - 1].hash : this.seed;
  }

  async append(type, payload = {}, meta = {}) {
    const safePayload = structuredClone(payload);
    const base = {
      seq: this.events.length + 1,
      timestamp: meta.timestamp || this.clock(),
      type,
      actor: meta.actor || "system",
      sessionId: meta.sessionId || null,
      prevHash: this.lastHash,
      payload: safePayload
    };
    const hash = await sha256Hex(canonicalJson(base));
    const event = deepFreeze({ ...base, hash });
    this.events.push(event);
    return structuredClone(event);
  }

  snapshot() {
    return structuredClone(this.events);
  }

  async verify(events = this.events) {
    let prevHash = this.seed;
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const base = {
        seq: event.seq,
        timestamp: event.timestamp,
        type: event.type,
        actor: event.actor,
        sessionId: event.sessionId,
        prevHash: event.prevHash,
        payload: event.payload
      };
      if (event.seq !== i + 1) return { ok: false, index: i, reason: "sequence_mismatch" };
      if (event.prevHash !== prevHash) return { ok: false, index: i, reason: "chain_mismatch" };
      const expected = await sha256Hex(canonicalJson(base));
      if (expected !== event.hash) return { ok: false, index: i, reason: "hash_mismatch" };
      prevHash = event.hash;
    }
    return { ok: true, count: events.length, head: prevHash };
  }

  async import(events) {
    const check = await this.verify(events);
    if (!check.ok) throw new Error("Invalid ledger: " + check.reason + " at event " + check.index);
    this.events = structuredClone(events).map(event => deepFreeze(event));
    return check;
  }
}
