const encoder = new TextEncoder();

function toHex(bytes: Uint8Array) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toHex(new Uint8Array(digest));
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toHex(new Uint8Array(signature));
}

export const MINING_V2_COOKIE = "dmi_v2_session";

export async function verifyMiningPassword(candidate: string, expected: string) {
  const [a, b] = await Promise.all([sha256(candidate), sha256(expected)]);
  return safeEqual(a, b);
}

export async function createMiningSessionToken(secret: string, ttlSeconds = 43200) {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `dmi-v2:${expiresAt}`;
  const signature = await hmac(payload, secret);
  return `${expiresAt}.${signature}`;
}

export async function verifyMiningSessionToken(token: string | undefined, secret: string) {
  if (!token || !secret) return false;
  const [expiresRaw, signature] = token.split(".");
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || !signature) return false;
  const expected = await hmac(`dmi-v2:${expiresAt}`, secret);
  return safeEqual(signature, expected);
}
