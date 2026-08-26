import { Router } from "express";
import { ActivityLog } from "../models/ActivityLog";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { STAFF_ACTIVITY_ROLES } from "../config/roles";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const scopeIds: string[] = [String(actor.id)];
    const orConditions: Record<string, unknown>[] = [{ scope: "user", scopeId: String(actor.id) }];

    if (STAFF_ACTIVITY_ROLES.includes(actor.role)) {
      orConditions.push({ scope: "global" });
    }
    if (
      (actor.role === "consortium_partner_admin" || actor.role === "consortium_partner_staff") &&
      actor.organizationId
    ) {
      orConditions.push({ scope: "partner", scopeId: String(actor.organizationId) });
    }

    const activity = await ActivityLog.find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ activity });
  })
);

export default router;
