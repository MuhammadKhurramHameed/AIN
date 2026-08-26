export interface AdapterCallOptions {
  apiKey: string;
  baseUrl?: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens: number;
  temperature: number;
}

export interface AdapterResult {
  text: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

/** Every provider adapter implements this — the gateway never knows which vendor it's calling. */
export interface AIProviderAdapter {
  generateText(opts: AdapterCallOptions): Promise<AdapterResult>;
}
