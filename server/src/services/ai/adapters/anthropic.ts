import { AdapterCallOptions, AdapterResult, AIProviderAdapter } from "../types";
import { ApiError } from "../../../utils/ApiError";

export const anthropicAdapter: AIProviderAdapter = {
  async generateText(opts: AdapterCallOptions): Promise<AdapterResult> {
    const base = (opts.baseUrl ?? "https://api.anthropic.com").replace(/\/$/, "");
    const res = await fetch(`${base}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": opts.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
        ...(opts.systemPrompt ? { system: opts.systemPrompt } : {}),
        messages: [{ role: "user", content: opts.prompt }],
      }),
    });

    const body: any = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(502, `AI provider error (${res.status}): ${body?.error?.message ?? "request failed"}`);
    }

    const text = (body?.content ?? []).map((c: { type: string; text?: string }) => (c.type === "text" ? c.text : "")).join("");
    return {
      text,
      promptTokens: body?.usage?.input_tokens,
      completionTokens: body?.usage?.output_tokens,
      totalTokens: (body?.usage?.input_tokens ?? 0) + (body?.usage?.output_tokens ?? 0),
    };
  },
};
