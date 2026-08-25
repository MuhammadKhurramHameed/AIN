import { Router } from "express";
import { z } from "zod";
import { Track } from "../models/Track";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = {};
    if (req.query.programmeId) filter.programmeId = req.query.programmeId;
    const tracks = await Track.find(filter).sort({ order: 1 });
    res.json({ tracks });
  })
);

const trackSchema = z.object({
  programmeId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  order: z.number().optional(),
});

router.post(
  "/",
  requireRole("super_admin", "moitt_staff", "content_admin"),
  asyncHandler(async (req, res) => {
    const body = trackSchema.parse(req.body);
    const existing = await Track.findOne({ programmeId: body.programmeId, name: body.name });
    if (existing) throw new ApiError(409, "A track with this name already exists in this programme");
    const track = await Track.create(body);
    res.status(201).json({ track });
  })
);

router.patch(
  "/:id",
  requireRole("super_admin", "moitt_staff", "content_admin"),
  asyncHandler(async (req, res) => {
    const body = trackSchema.partial().parse(req.body);
    const track = await Track.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!track) throw new ApiError(404, "Track not found");
    res.json({ track });
  })
);

export default router;
