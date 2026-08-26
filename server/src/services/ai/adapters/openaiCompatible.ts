import { AdapterCallOptions, AdapterResult, AIProviderAdapter } from "../types";
import { ApiError } from "../../../utils/ApiError";

/**
 * Works for OpenAI, self-hosted OpenAI-compatible endpoints, Ollama, and vLLM — anything
 * that implements POST {baseUrl}/chat/completions with the OpenAI request/response shape.
 * Azure OpenAI is handled by a thin variant below (different auth header + URL shape).
 */
export const openaiCompatibleAdapter: AIProviderAdapter = {
  async generateText(opts: AdapterCallOptions): Promise<AdapterResult> {
    const base = (opts.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(opts.apiKey ? { Authorization: `Bearer ${opts.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: opts.model,
        messages: [
          ...(opts.systemPrompt ? [{ role: "system", content: opts.systemPrompt }] : []),
          { role: "user", content: opts.prompt },
        ],
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
      }),
    });

    const body: any = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(502, `AI provider error (${res.status}): ${body?.error?.message ?? "request failed"}`);
    }

    const text = body?.choices?.[0]?.message?.content ?? "";
    return {
      text,
      promptTokens: body?.usage?.prompt_tokens,
      completionTokens: body?.usage?.completion_tokens,
      totalTokens: body?.usage?.total_tokens,
    };
  },
};

/** Azure OpenAI: `api-key` header instead of Bearer, and the deployment URL already encodes the model. */
export const azureOpenAIAdapter: AIProviderAdapter = {
  async generateText(opts: AdapterCallOptions): Promise<AdapterResult> {
    if (!opts.baseUrl) throw new ApiError(500, "Azure OpenAI provider is missing its deployment base URL");
    const url = opts.baseUrl.includes("api-version") ? opts.baseUrl : `${opts.baseUrl}${opts.baseUrl.includes("?") ? "&" : "?"}api-version=2024-06-01`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": opts.apiKey },
      body: JSON.stringify({
        messages: [
          ...(opts.systemPrompt ? [{ role: "system", content: opts.systemPrompt }] : []),
          { role: "user", content: opts.prompt },
        ],
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
      }),
    });

    const body: any = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(502, `AI provider error (${res.status}): ${body?.error?.message ?? "request failed"}`);
    }

    const text = body?.choices?.[0]?.message?.content ?? "";
    return {
      text,
      promptTokens: body?.usage?.prompt_tokens,
      completionTokens: body?.usage?.completion_tokens,
      totalTokens: body?.usage?.total_tokens,
    };
  },
};
