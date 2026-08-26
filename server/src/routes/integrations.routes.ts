import { Router } from "express";
import { z } from "zod";
import { Integration } from "../models/Integration";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { encryptSecret, decryptSecret } from "../utils/crypto";
import { testSmtpConnection, SmtpConfig, SmtpSecrets } from "../services/integrations/smtp";

const router = Router();
router.use(requireAuth, requireRole("super_admin"));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const integrations = await Integration.find().sort({ createdAt: -1 });
    res.json({
      integrations: integrations.map((i) => ({
        id: i.id,
        category: i.category,
        type: i.type,
        name: i.name,
        config: i.config,
        status: i.status,
        lastTestedAt: i.lastTestedAt,
        lastError: i.lastError,
        hasSecrets: !!i.secretsEncrypted,
      })),
    });
  })
);

const smtpSchema = z.object({
  name: z.string().min(1),
  config: z.object({
    host: z.string().min(1),
    port: z.number().int().positive(),
    secure: z.boolean(),
    fromAddress: z.string().email(),
    fromName: z.string().optional(),
  }),
  secrets: z.object({
    user: z.string().min(1),
    pass: z.string().min(1),
  }),
});

router.post(
  "/smtp",
  asyncHandler(async (req, res) => {
    const body = smtpSchema.parse(req.body);
    const integration = await Integration.create({
      category: "communication",
      type: "smtp",
      name: body.name,
      config: body.config,
      secretsEncrypted: encryptSecret(JSON.stringify(body.secrets)),
      createdBy: req.user!.id,
    });
    res.status(201).json({ integration: { id: integration.id, name: integration.name, type: integration.type, status: integration.status } });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const status = z.enum(["active", "disabled"]).optional().parse(req.body.status);
    const integration = await Integration.findById(req.params.id);
    if (!integration) throw new ApiError(404, "Integration not found");
    if (status) integration.status = status;
    await integration.save();
    res.json({ ok: true });
  })
);

router.post(
  "/:id/test",
  asyncHandler(async (req, res) => {
    const integration = await Integration.findById(req.params.id);
    if (!integration) throw new ApiError(404, "Integration not found");
    if (!integration.secretsEncrypted) throw new ApiError(400, "Integration has no credentials configured");

    if (integration.type === "smtp") {
      const secrets = JSON.parse(decryptSecret(integration.secretsEncrypted)) as SmtpSecrets;
      try {
        await testSmtpConnection(integration.config as unknown as SmtpConfig, secrets);
        integration.status = "active";
        integration.lastTestedAt = new Date();
        integration.lastError = undefined;
        await integration.save();
        return res.json({ ok: true });
      } catch (err) {
        integration.status = "error";
        integration.lastTestedAt = new Date();
        integration.lastError = err instanceof Error ? err.message : "Connection test failed";
        await integration.save();
        return res.json({ ok: false, error: integration.lastError });
      }
    }

    throw new ApiError(400, `No test implemented for integration type "${integration.type}"`);
  })
);

export default router;
