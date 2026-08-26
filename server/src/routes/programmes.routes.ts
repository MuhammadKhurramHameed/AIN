import { Router } from "express";
import { z } from "zod";
import { Programme } from "../models/Programme";
import { Track } from "../models/Track";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { STAFF_ACTIVITY_ROLES } from "../config/roles";

const router = Router();
router.use(requireAuth);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

router.get(
  "/",
  requireRole(...STAFF_ACTIVITY_ROLES),
  asyncHandler(async (_req, res) => {
    const programmes = await Programme.find().sort({ createdAt: 1 });
    const trackCounts = await Track.aggregate([{ $group: { _id: "$programmeId", count: { $sum: 1 } } }]);
    const countByProgramme = new Map(trackCounts.map((t) => [String(t._id), t.count]));

    res.json({
      programmes: programmes.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        targetParticipants: p.targetParticipants,
        genderTargetPct: p.genderTargetPct,
        status: p.status,
        trackCount: countByProgramme.get(String(p._id)) ?? 0,
        createdAt: p.createdAt,
      })),
    });
  })
);

const programmeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  targetParticipants: z.number().min(0).optional(),
  genderTargetPct: z.number().min(0).max(100).optional(),
});

router.post(
  "/",
  requireRole("super_admin"),
  asyncHandler(async (req, res) => {
    const body = programmeSchema.parse(req.body);
    const slug = slugify(body.name);
    const existing = await Programme.findOne({ slug });
    if (existing) throw new ApiError(409, "A programme with this name already exists");

    const programme = await Programme.create({ ...body, slug, createdBy: req.user!.id });
    res.status(201).json({ programme });
  })
);

router.patch(
  "/:id",
  requireRole("super_admin"),
  asyncHandler(async (req, res) => {
    const body = programmeSchema
      .partial()
      .extend({ status: z.enum(["active", "archived"]).optional() })
      .parse(req.body);
    const programme = await Programme.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!programme) throw new ApiError(404, "Programme not found");
    res.json({ programme });
  })
);

export default router;
