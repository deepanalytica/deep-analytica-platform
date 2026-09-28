import { validateTask } from "./contracts.mjs";

export class TaskScheduler {
  constructor() {
    this.tasks = new Map();
  }

  add(task) {
    validateTask(task);
    if (this.tasks.has(task.id)) throw new Error("Duplicate task id: " + task.id);
    const maxAttempts = Math.max(1, Math.min(3, Number(task.maxAttempts || 1)));
    const normalized = {
      id: task.id,
      title: task.title || task.id,
      role: task.role || "worker",
      provider: task.provider || "fixture",
      model: task.model || null,
      input: task.input || "",
      dependsOn: Array.from(new Set(task.dependsOn || [])),
      status: "QUEUED",
      attempts: 0,
      maxAttempts,
      output: null,
      error: null,
      metadata: structuredClone(task.metadata || {})
    };
    this.tasks.set(normalized.id, normalized);
    return structuredClone(normalized);
  }

  get(id) {
    return this.tasks.get(id) || null;
  }

  list() {
    return Array.from(this.tasks.values()).map(t => structuredClone(t));
  }

  ready() {
    return Array.from(this.tasks.values()).filter(task => {
      if (task.status !== "QUEUED") return false;
      return task.dependsOn.every(dep => this.tasks.get(dep)?.status === "COMPLETED");
    });
  }

  blockedByFailure() {
    return Array.from(this.tasks.values()).filter(task => {
      if (task.status !== "QUEUED") return false;
      return task.dependsOn.some(dep => ["FAILED", "BLOCKED"].includes(this.tasks.get(dep)?.status));
    });
  }

  async run(executor, hooks = {}) {
    while (true) {
      const blocked = this.blockedByFailure();
      for (const task of blocked) {
        task.status = "BLOCKED";
        task.error = "Dependency failed or was blocked.";
        if (hooks.onTask) await hooks.onTask({ type: "blocked", task: structuredClone(task) });
      }

      const ready = this.ready();
      if (!ready.length) break;

      for (const task of ready) {
        let completed = false;
        while (!completed && task.attempts < task.maxAttempts) {
          task.attempts += 1;
          task.status = "RUNNING";
          if (hooks.onTask) await hooks.onTask({ type: "running", task: structuredClone(task) });
          try {
            const output = await executor(structuredClone(task), this);
            task.output = structuredClone(output);
            task.status = "COMPLETED";
            task.error = null;
            completed = true;
            if (hooks.onTask) await hooks.onTask({ type: "completed", task: structuredClone(task) });
          } catch (error) {
            task.error = String(error?.message || error).slice(0, 2000);
            if (task.attempts < task.maxAttempts) {
              task.status = "QUEUED";
              if (hooks.onTask) await hooks.onTask({ type: "retry", task: structuredClone(task) });
            } else {
              task.status = "FAILED";
              if (hooks.onTask) await hooks.onTask({ type: "failed", task: structuredClone(task) });
            }
          }
        }
      }
    }

    const pending = Array.from(this.tasks.values()).filter(t => t.status === "QUEUED");
    for (const task of pending) {
      task.status = "BLOCKED";
      task.error = "Unresolvable dependency graph.";
      if (hooks.onTask) await hooks.onTask({ type: "blocked", task: structuredClone(task) });
    }

    return this.list();
  }
}
