export class BudgetExceededError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "BudgetExceededError";
    this.details = details;
  }
}

export class ExecutionBudget {
  constructor({
    maxProviderCalls = 32,
    maxTasks = 24,
    maxInputChars = 250000,
    maxOutputChars = 500000,
    maxWallClockMs = 180000
  } = {}) {
    this.limits = { maxProviderCalls, maxTasks, maxInputChars, maxOutputChars, maxWallClockMs };
    this.startedAt = Date.now();
    this.providerCalls = 0;
    this.tasks = 0;
    this.inputChars = 0;
    this.outputChars = 0;
  }

  assertTime() {
    const elapsed = Date.now() - this.startedAt;
    if (elapsed > this.limits.maxWallClockMs) {
      throw new BudgetExceededError("Wall-clock budget exceeded.", { elapsed, limit: this.limits.maxWallClockMs });
    }
  }

  registerTasks(count) {
    this.tasks += count;
    if (this.tasks > this.limits.maxTasks) {
      throw new BudgetExceededError("Task budget exceeded.", { tasks: this.tasks, limit: this.limits.maxTasks });
    }
  }

  registerProviderCall(input = "") {
    this.assertTime();
    this.providerCalls += 1;
    this.inputChars += String(input || "").length;
    if (this.providerCalls > this.limits.maxProviderCalls) {
      throw new BudgetExceededError("Provider-call budget exceeded.", {
        calls: this.providerCalls,
        limit: this.limits.maxProviderCalls
      });
    }
    if (this.inputChars > this.limits.maxInputChars) {
      throw new BudgetExceededError("Input-character budget exceeded.", {
        inputChars: this.inputChars,
        limit: this.limits.maxInputChars
      });
    }
  }

  registerProviderOutput(output = "") {
    this.outputChars += String(output || "").length;
    if (this.outputChars > this.limits.maxOutputChars) {
      throw new BudgetExceededError("Output-character budget exceeded.", {
        outputChars: this.outputChars,
        limit: this.limits.maxOutputChars
      });
    }
  }

  snapshot() {
    return {
      limits: { ...this.limits },
      usage: {
        providerCalls: this.providerCalls,
        tasks: this.tasks,
        inputChars: this.inputChars,
        outputChars: this.outputChars,
        elapsedMs: Date.now() - this.startedAt
      }
    };
  }
}

export async function withAbortTimeout(fn, timeoutMs = 60000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("Provider timeout.")), timeoutMs);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}
