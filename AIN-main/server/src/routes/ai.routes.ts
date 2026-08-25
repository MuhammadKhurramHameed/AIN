import { Router } from "express";
import { z } from "zod";
import { AIProvider } from "../models/AIProvider";
import { AIModel } from "../models/AIModel";
import { AIUsageLog } from "../models/AIUsageLog";
import { AI_CAPABILITIES } from "../config/aiCapabilities";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { encryptSecret, maskSecret } from "../utils/crypto";
import { testProviderModel } from "../services/ai/gateway";
import { logAudit } from "../utils/audit";

const router = Router();
router.use(requireAuth, requireRole("super_admin"));

function serializeProvider(p: InstanceType<typeof AIProvider>, rawKeyForMasking: string) {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    baseUrl: p.baseUrl,
    status: p.status,
    apiKeyMasked: maskSecret(rawKeyForMasking),
    createdAt: p.createdAt,
  };
}

// --- Providers ---

router.get(
  "/providers",
  asyncHandler(async (_req, res) => {
    const providers = await AIProvider.find().sort({ createdAt: -1 });
    // apiKeyEncrypted never leaves the server — mask using its own ciphertext length as a stand-in
    // (real masking of the decrypted value happens only right after creation, below).
    res.json({ providers: providers.map((p) => ({ id: p.id, name: p.name, type: p.type, baseUrl: p.baseUrl, status: p.status, createdAt: p.createdAt })) });
  })
);

const providerSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["openai", "azure_openai", "openai_compatible", "ollama", "anthropic"]),
  baseUrl: z.string().optional(),
  apiKey: z.string().min(1),
});

router.post(
  "/providers",
  asyncHandler(async (req, res) => {
    const body = providerSchema.parse(req.body);
    const provider = await AIProvider.create({
      name: body.name,
      type: body.type,
      baseUrl: body.baseUrl,
      apiKeyEncrypted: encryptSecret(body.apiKey),
      createdBy: req.user!.id,
    });
    await logAudit({ action: "ai_provider_created", actor: req.user!, req, success: true, targetType: "AIProvider", targetId: provider.id, metadata: { name: provider.name, type: provider.type } });
    res.status(201).json({ provider: serializeProvider(provider, body.apiKey) });
  })
);

router.patch(
  "/providers/:id",
  asyncHandler(async (req, res) => {
    const body = providerSchema.partial().parse(req.body);
    const update: Record<string, unknown> = { ...body };
    delete update.apiKey;
    if (body.apiKey) update.apiKeyEncrypted = encryptSecret(body.apiKey);

    const provider = await AIProvider.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!provider) throw new ApiError(404, "Provider not found");
    await logAudit({
      action: "ai_provider_updated",
      actor: req.user!,
      req,
      success: true,
      targetType: "AIProvider",
      targetId: provider.id,
      metadata: { fields: Object.keys(update), apiKeyRotated: !!body.apiKey },
    });
    res.json({ provider: { id: provider.id, name: provider.name, type: provider.type, baseUrl: provider.baseUrl, status: provider.status } });
  })
);

// --- Models ---

router.get(
  "/models",
  asyncHandler(async (_req, res) => {
    const models = await AIModel.find().populate("providerId", "name type status").sort({ createdAt: -1 });
    res.json({ models });
  })
);

const modelSchema = z.object({
  providerId: z.string(),
  name: z.string().min(1),
  label: z.string().min(1),
  capabilities: z.array(z.enum(AI_CAPABILITIES)).default([]),
  defaultForCapabilities: z.array(z.enum(AI_CAPABILITIES)).default([]),
  maxTokens: z.number().min(1).max(32000).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

router.post(
  "/models",
  asyncHandler(async (req, res) => {
    const body = modelSchema.parse(req.body);
    // Only one model may be the default route for a given capability — clear any prior holder.
    if (body.defaultForCapabilities.length > 0) {
      await AIModel.updateMany(
        { defaultForCapabilities: { $in: body.defaultForCapabilities } },
        { $pull: { defaultForCapabilities: { $in: body.defaultForCapabilities } } }
      );
    }
    const model = await AIModel.create(body);
    res.status(201).json({ model });
  })
);

router.patch(
  "/models/:id",
  asyncHandler(async (req, res) => {
    const body = modelSchema.partial().parse(req.body);
    if (body.defaultForCapabilities && body.defaultForCapabilities.length > 0) {
      await AIModel.updateMany(
        { _id: { $ne: req.params.id }, defaultForCapabilities: { $in: body.defaultForCapabilities } },
        { $pull: { defaultForCapabilities: { $in: body.defaultForCapabilities } } }
      );
    }
    const model = await AIModel.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!model) throw new ApiError(404, "Model not found");
    res.json({ model });
  })
);

router.post(
  "/models/:id/test",
  asyncHandler(async (req, res) => {
    const model = await AIModel.findById(req.params.id).populate("providerId");
    if (!model) throw new ApiError(404, "Model not found");
    const provider = model.providerId as unknown as InstanceType<typeof AIProvider>;
    if (!provider) throw new ApiError(400, "Model has no provider");

    try {
      const result = await testProviderModel(provider, model, req.user!.id);
      res.json({ ok: true, ...result });
    } catch (err) {
      res.status(200).json({ ok: false, error: err instanceof Error ? err.message : "Test failed" });
    }
  })
);

// --- Usage ---

router.get(
  "/usage",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    const logs = await AIUsageLog.find()
      .populate("providerId", "name type")
      .populate("modelId", "label")
      .populate("actorId", "name")
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ logs });
  })
);

router.get(
  "/usage/summary",
  asyncHandler(async (_req, res) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalRequests, requestsToday, failuresTotal, byFeature, byProvider] = await Promise.all([
      AIUsageLog.countDocuments({}),
      AIUsageLog.countDocuments({ createdAt: { $gte: startOfToday } }),
      AIUsageLog.countDocuments({ success: false }),
      AIUsageLog.aggregate([
        { $group: { _id: "$feature", requests: { $sum: 1 }, tokens: { $sum: { $ifNull: ["$totalTokens", 0] } } } },
        { $project: { feature: "$_id", requests: 1, tokens: 1, _id: 0 } },
        { $sort: { requests: -1 } },
      ]),
      AIUsageLog.aggregate([
        { $group: { _id: "$providerId", requests: { $sum: 1 }, avgLatency: { $avg: "$latencyMs" } } },
        { $lookup: { from: "aiproviders", localField: "_id", foreignField: "_id", as: "provider" } },
        { $unwind: { path: "$provider", preserveNullAndEmptyArrays: true } },
        { $project: { provider: "$provider.name", requests: 1, avgLatency: { $round: ["$avgLatency", 0] }, _id: 0 } },
        { $sort: { requests: -1 } },
      ]),
    ]);

    const totalTokensAgg = await AIUsageLog.aggregate([{ $group: { _id: null, tokens: { $sum: { $ifNull: ["$totalTokens", 0] } } } }]);

    res.json({
      totalRequests,
      requestsToday,
      failureRate: totalRequests > 0 ? Math.round((failuresTotal / totalRequests) * 100) : 0,
      totalTokens: totalTokensAgg[0]?.tokens ?? 0,
      byFeature,
      byProvider,
    });
  })
);

export default router;
