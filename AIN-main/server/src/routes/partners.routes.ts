import { Router } from "express";
import { z } from "zod";
import { ConsortiumPartner } from "../models/ConsortiumPartner";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const router = Router();
router.use(requireAuth);

const partnerSchema = z.object({
  name: z.string().min(1),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    if (actor.role === "consortium_partner_admin" || actor.role === "consortium_partner_staff") {
      const partner = await ConsortiumPartner.findById(actor.organizationId);
      return res.json({ partners: partner ? [partner] : [] });
    }
    const partners = await ConsortiumPartner.find().sort({ createdAt: -1 });
    res.json({ partners });
  })
);

router.post(
  "/",
  requireRole("super_admin", "moitt_staff"),
  asyncHandler(async (req, res) => {
    const body = partnerSchema.parse(req.body);
    const existing = await ConsortiumPartner.findOne({ name: body.name });
    if (existing) throw new ApiError(409, "A partner with this name already exists");
    const partner = await ConsortiumPartner.create({ ...body, createdBy: req.user!.id });
    res.status(201).json({ partner });
  })
);

router.patch(
  "/:id",
  requireRole("super_admin", "moitt_staff"),
  asyncHandler(async (req, res) => {
    const body = partnerSchema.partial().extend({ status: z.enum(["active", "inactive"]).optional() }).parse(req.body);
    const partner = await ConsortiumPartner.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!partner) throw new ApiError(404, "Partner not found");
    res.json({ partner });
  })
);

export default router;
