export class FixtureProvider {
  constructor(resolver) {
    this.resolver = resolver;
  }

  async generate(request) {
    if (typeof this.resolver === "function") return this.resolver(request);
    if (typeof this.resolver === "string") return this.resolver;
    return JSON.stringify(this.resolver ?? {});
  }
}
