export class OpenAIProvider {
  constructor({ apiKey, baseUrl = "https://api.openai.com/v1", defaultModel = null, fetchImpl = fetch } = {}) {
    if (!apiKey) throw new Error("OpenAIProvider requires apiKey.");
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.defaultModel = defaultModel;
    this.fetch = fetchImpl;
  }

  async generate({ model, system = "", input = "", signal = undefined }) {
    const selectedModel = model || this.defaultModel;
    if (!selectedModel) throw new Error("OpenAI model must be specified.");
    const response = await this.fetch(this.baseUrl + "/responses", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + this.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        instructions: system || undefined,
        input
      }),
      signal
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error("OpenAI API error " + response.status + ": " + JSON.stringify(body));
    }

    const texts = [];
    for (const item of body.output || []) {
      if (item.type !== "message") continue;
      for (const part of item.content || []) {
        if ((part.type === "output_text" || part.type === "text") && typeof part.text === "string") {
          texts.push(part.text);
        }
      }
    }
    if (!texts.length && typeof body.output_text === "string") texts.push(body.output_text);
    if (!texts.length) throw new Error("OpenAI response did not contain text output.");
    return texts.join("\n");
  }
}
