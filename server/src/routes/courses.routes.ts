import { Router } from "express";
import { z } from "zod";
import { Course } from "../models/Course";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { logActivity } from "../utils/activity";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const filter: Record<string, unknown> = {};
    if (req.query.trackId) filter.trackId = req.query.trackId;

    if (actor.role === "trainee") filter.status = "published";
    if (actor.role === "tutor") filter.tutors = actor.id;
    if (actor.role === "content_admin" && req.query.mine === "true") filter.contentAdminId = actor.id;

    const courses = await Course.find(filter)
      .populate("trackId", "name")
      .populate("tutors", "name email")
      .sort({ createdAt: -1 });
    res.json({ courses });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id).populate("trackId", "name").populate("tutors", "name email");
    if (!course) throw new ApiError(404, "Course not found");
    res.json({ course });
  })
);

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  trackId: z.string(),
  level: z.enum(["level_1", "level_2", "level_3"]).optional(),
  tutors: z.array(z.string()).optional(),
});

router.post(
  "/",
  requireRole("super_admin", "moitt_staff", "content_admin"),
  asyncHandler(async (req, res) => {
    const body = courseSchema.parse(req.body);
    const course = await Course.create({ ...body, contentAdminId: req.user!.id, tutors: body.tutors ?? [] });
    res.status(201).json({ course });
  })
);

router.patch(
  "/:id",
  requireRole("super_admin", "moitt_staff", "content_admin"),
  asyncHandler(async (req, res) => {
    const body = courseSchema
      .partial()
      .extend({ status: z.enum(["draft", "published"]).optional() })
      .parse(req.body);
    const before = await Course.findById(req.params.id);
    const course = await Course.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!course) throw new ApiError(404, "Course not found");

    if (body.status === "published" && before?.status !== "published") {
      const actor = req.user!;
      await logActivity({
        type: "course_published",
        message: `${actor.name} published ${course.title}`,
        actorId: actor.id,
        actorName: actor.name,
        scope: "global",
      });
    }

    res.json({ course });
  })
);

export default router;
