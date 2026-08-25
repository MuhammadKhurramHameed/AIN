import { AIProvider, IAIProvider } from "../../models/AIProvider";
import { AIModel, IAIModel } from "../../models/AIModel";
import { AIUsageLog } from "../../models/AIUsageLog";
import { AICapability } from "../../config/aiCapabilities";
import { decryptSecret } from "../../utils/crypto";
import { ApiError } from "../../utils/ApiError";
import { AIProviderAdapter } from "./types";
import { openaiCompatibleAdapter, azureOpenAIAdapter } from "./adapters/openaiCompatible";
import { anthropicAdapter } from "./adapters/anthropic";

function adapterFor(providerType: IAIProvider["type"]): AIProviderAdapter {
  switch (providerType) {
    case "anthropic":
      return anthropicAdapter;
    case "azure_openai":
      return azureOpenAIAdapter;
    case "openai":
    case "openai_compatible":
    case "ollama":
    default:
      return openaiCompatibleAdapter;
  }
}

interface GenerateTextInput {
  capability: AICapability;
  prompt: string;
  systemPrompt?: string;
  actorId?: string;
  feature: string;
}

/**
 * The one place in the codebase that talks to an AI provider. Every feature asks for a
 * *capability* ("lesson_assistant", "question_generation", ...); the gateway resolves
 * that to whichever model a Super Admin has configured as the default for it, calls the
 * right adapter, and logs usage — so switching vendors or models never touches feature code.
 */
export async function generateText(input: GenerateTextInput): Promise<{ text: string }> {
  const model = await AIModel.findOne({
    capabilities: input.capability,
    defaultForCapabilities: input.capability,
    status: "active",
  }).populate<{ providerId: IAIProvider }>("providerId");

  if (!model || !model.providerId || (model.providerId as unknown as IAIProvider).status !== "active") {
    throw new ApiError(503, `AI is not configured for "${input.capability}" yet — ask a Super Admin to set up a provider.`);
  }

  const provider = model.providerId as unknown as IAIProvider;
  const adapter = adapterFor(provider.type);
  const apiKey = decryptSecret(provider.apiKeyEncrypted);
  const start = Date.now();

  try {
    const result = await adapter.generateText({
      apiKey,
      baseUrl: provider.baseUrl,
      model: model.name,
      prompt: input.prompt,
      systemPrompt: input.systemPrompt,
      maxTokens: model.maxTokens,
      temperature: model.temperature,
    });

    await AIUsageLog.create({
      providerId: provider.id,
      modelId: model.id,
      capability: input.capability,
      feature: input.feature,
      actorId: input.actorId,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      totalTokens: result.totalTokens,
      latencyMs: Date.now() - start,
      success: true,
    });

    return { text: result.text };
  } catch (err) {
    await AIUsageLog.create({
      providerId: provider.id,
      modelId: model.id,
      capability: input.capability,
      feature: input.feature,
      actorId: input.actorId,
      latencyMs: Date.now() - start,
      success: false,
      errorMessage: err instanceof Error ? err.message : "Unknown error",
    });
    throw err;
  }
}

/** Direct provider+model test (bypasses capability routing) for the "Test connection" button. */
export async function testProviderModel(
  provider: IAIProvider,
  model: IAIModel,
  actorId?: string
): Promise<{ text: string; latencyMs: number }> {
  const adapter = adapterFor(provider.type);
  const apiKey = decryptSecret(provider.apiKeyEncrypted);
  const start = Date.now();

  try {
    const result = await adapter.generateText({
      apiKey,
      baseUrl: provider.baseUrl,
      model: model.name,
      prompt: 'Reply with exactly one word: "OK".',
      maxTokens: 10,
      temperature: 0,
    });
    const latencyMs = Date.now() - start;
    await AIUsageLog.create({
      providerId: provider.id,
      modelId: model.id,
      capability: "chat",
      feature: "provider_test",
      actorId,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      totalTokens: result.totalTokens,
      latencyMs,
      success: true,
    });
    return { text: result.text, latencyMs };
  } catch (err) {
    await AIUsageLog.create({
      providerId: provider.id,
      modelId: model.id,
      capability: "chat",
      feature: "provider_test",
      actorId,
      latencyMs: Date.now() - start,
      success: false,
      errorMessage: err instanceof Error ? err.message : "Unknown error",
    });
    throw err;
  }
}
