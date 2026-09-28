import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

function safeId(id) {
  if (!/^[A-Za-z0-9._-]+$/.test(id || "")) throw new Error("Unsafe session id.");
  return id;
}

function decodeKey(value) {
  if (!value) throw new Error("EncryptedFileSessionStore requires a data key.");
  let key;
  if (/^[0-9a-fA-F]{64}$/.test(value)) key = Buffer.from(value, "hex");
  else key = Buffer.from(value, "base64");
  if (key.length !== 32) {
    throw new Error("PRAXIOS_DATA_KEY must decode to exactly 32 bytes.");
  }
  return key;
}

export class EncryptedFileSessionStore {
  constructor({
    directory = process.env.PRAXIOS_DATA_DIR || ".praxios-data",
    key
  } = {}) {
    this.directory = path.resolve(directory);
    this.key = decodeKey(key);
  }

  filePath(id) {
    return path.join(this.directory, safeId(id) + ".enc.json");
  }

  async ensureDirectory() {
    await fs.mkdir(this.directory, { recursive: true, mode: 0o700 });
  }

  encrypt(snapshot) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", this.key, iv);
    const plaintext = Buffer.from(JSON.stringify(snapshot), "utf8");
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      version: 1,
      algorithm: "aes-256-gcm",
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
      ciphertext: ciphertext.toString("base64")
    };
  }

  decrypt(envelope) {
    if (envelope?.version !== 1 || envelope?.algorithm !== "aes-256-gcm") {
      throw new Error("Unsupported encrypted session envelope.");
    }
    const iv = Buffer.from(envelope.iv, "base64");
    const tag = Buffer.from(envelope.tag, "base64");
    const ciphertext = Buffer.from(envelope.ciphertext, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", this.key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(plaintext.toString("utf8"));
  }

  async save(snapshot) {
    const id = snapshot?.state?.sessionId;
    if (!id) throw new Error("Snapshot requires state.sessionId.");
    await this.ensureDirectory();
    const target = this.filePath(id);
    const temp = target + ".tmp";
    const payload = JSON.stringify(this.encrypt(snapshot));
    await fs.writeFile(temp, payload, { encoding: "utf8", mode: 0o600 });
    await fs.rename(temp, target);
    return target;
  }

  async load(id) {
    const raw = await fs.readFile(this.filePath(id), "utf8");
    return this.decrypt(JSON.parse(raw));
  }

  async has(id) {
    try {
      await fs.access(this.filePath(id));
      return true;
    } catch {
      return false;
    }
  }

  async list() {
    await this.ensureDirectory();
    const files = await fs.readdir(this.directory);
    return files.filter(name => name.endsWith(".enc.json")).map(name => name.slice(0, -9));
  }
}
