export class AnthropicProvider {
  constructor({
    apiKey,
    baseUrl = "https://api.anthropic.com/v1",
    defaultModel = null,
    maxTokens = 4096,
    anthropicVersion = "2023-06-01",
    fetchImpl = fetch
  } = {}) {
    if (!apiKey) throw new Error("AnthropicProvider requires apiKey.");
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.defaultModel = defaultModel;
    this.maxTokens = maxTokens;
    this.anthropicVersion = anthropicVersion;
    this.fetch = fetchImpl;
  }

  async generate({ model, system = "", input = "", signal = undefined }) {
    const selectedModel = model || this.defaultModel;
    if (!selectedModel) throw new Error("Anthropic model must be specified.");

    const response = await this.fetch(this.baseUrl + "/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": this.anthropicVersion,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: this.maxTokens,
        system: system || undefined,
        messages: [{ role: "user", content: input }]
      }),
      signal
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error("Anthropic API error " + response.status + ": " + JSON.stringify(body));
    }

    const texts = (body.content || [])
      .filter(part => part.type === "text" && typeof part.text === "string")
      .map(part => part.text);

    if (!texts.length) throw new Error("Anthropic response did not contain text output.");
    return texts.join("\n");
  }
}
