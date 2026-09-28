import fs from "node:fs/promises";
import path from "node:path";

function safeId(id) {
  if (!/^[A-Za-z0-9._-]+$/.test(id || "")) throw new Error("Unsafe session id.");
  return id;
}

export class FileSessionStore {
  constructor({ directory = process.env.PRAXIOS_DATA_DIR || ".praxios-data" } = {}) {
    this.directory = path.resolve(directory);
  }

  filePath(id) {
    return path.join(this.directory, safeId(id) + ".json");
  }

  async ensureDirectory() {
    await fs.mkdir(this.directory, { recursive: true });
  }

  async save(snapshot) {
    const id = snapshot?.state?.sessionId;
    if (!id) throw new Error("Snapshot requires state.sessionId.");
    await this.ensureDirectory();
    const target = this.filePath(id);
    const temp = target + ".tmp";
    const payload = JSON.stringify(snapshot, null, 2);
    await fs.writeFile(temp, payload, "utf8");
    await fs.rename(temp, target);
    return target;
  }

  async load(id) {
    const raw = await fs.readFile(this.filePath(id), "utf8");
    return JSON.parse(raw);
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
    return files.filter(name => name.endsWith(".json")).map(name => name.slice(0, -5));
  }
}
