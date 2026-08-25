import { Router } from "express";
import { z } from "zod";
import { Report } from "../models/Report";
import { ConsortiumPartner } from "../models/ConsortiumPartner";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { logActivity } from "../utils/activity";
import { STAFF_ACTIVITY_ROLES } from "../config/roles";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  requireRole(...STAFF_ACTIVITY_ROLES, "consortium_partner_admin", "consortium_partner_staff"),
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const filter: Record<string, unknown> = {};
    if (actor.role === "consortium_partner_admin" || actor.role === "consortium_partner_staff") {
      filter.partnerId = actor.organizationId;
    } else if (req.query.partnerId) {
      filter.partnerId = req.query.partnerId;
    }
    const reports = await Report.find(filter).populate("partnerId", "name").sort({ createdAt: -1 });
    res.json({ reports });
  })
);

const reportSchema = z.object({
  period: z.string().min(1),
  metrics: z.object({
    enrolled: z.number().min(0),
    completed: z.number().min(0),
    femalePct: z.number().min(0).max(100),
    dropouts: z.number().min(0),
  }),
  narrative: z.string().optional(),
});

router.post(
  "/",
  requireRole("consortium_partner_admin", "consortium_partner_staff"),
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const body = reportSchema.parse(req.body);
    const report = await Report.findOneAndUpdate(
      { partnerId: actor.organizationId, period: body.period },
      { ...body, partnerId: actor.organizationId, submittedBy: actor.id, status: "submitted" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const partner = await ConsortiumPartner.findById(actor.organizationId);
    await logActivity({
      type: "report_submitted",
      message: `${partner?.name ?? "A partner"} submitted their ${body.period} report`,
      actorId: actor.id,
      actorName: actor.name,
      scope: "partner",
      scopeId: String(actor.organizationId),
    });

    res.status(201).json({ report });
  })
);

router.patch(
  "/:id/review",
  requireRole("super_admin", "moitt_staff"),
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: "reviewed", reviewedBy: actor.id },
      { new: true }
    ).populate("partnerId", "name");
    if (!report) throw new ApiError(404, "Report not found");

    const partnerName = (report.partnerId as unknown as { name?: string })?.name ?? "a partner";
    await logActivity({
      type: "report_reviewed",
      message: `${actor.name} reviewed ${partnerName}'s ${report.period} report`,
      actorId: actor.id,
      actorName: actor.name,
      scope: "partner",
      scopeId: String((report.partnerId as unknown as { _id?: string })?._id ?? report.partnerId),
    });

    res.json({ report });
  })
);

export default router;
