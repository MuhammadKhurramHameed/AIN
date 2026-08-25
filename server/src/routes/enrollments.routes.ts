import { Router } from "express";
import { z } from "zod";
import { Enrollment } from "../models/Enrollment";
import { Certificate } from "../models/Certificate";
import { Course } from "../models/Course";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { logActivity } from "../utils/activity";
import { parsePagination, paginationMeta } from "../utils/pagination";
import { User } from "../models/User";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const filter: Record<string, unknown> = {};
    if (actor.role === "trainee") {
      filter.userId = actor.id;
    } else {
      if (req.query.userId) filter.userId = req.query.userId;
      if (req.query.courseId) filter.courseId = req.query.courseId;
    }

    // Free-text search on the trainee's name/email — used by pickers (e.g. "add trainee to
    // cohort") to narrow a potentially thousands-strong course roster instead of paging
    // through it. Enrollment has no name/email of its own, so resolve matching trainees first.
    if (typeof req.query.q === "string" && req.query.q.trim().length > 0 && actor.role !== "trainee") {
      const q = req.query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matches = await User.find({ role: "trainee", $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] })
        .select("_id")
        .lean();
      filter.userId = { $in: matches.map((m) => m._id) };
    }

    const pagination = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
    const [enrollments, total] = await Promise.all([
      Enrollment.find(filter)
        .populate("courseId", "title trackId level")
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Enrollment.countDocuments(filter),
    ]);
    res.json({ enrollments, ...paginationMeta(total, pagination) });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    if (actor.role !== "trainee") throw new ApiError(403, "Only trainees can self-enroll");
    const courseId = z.string().parse(req.body.courseId);
    const existing = await Enrollment.findOne({ userId: actor.id, courseId });
    if (existing) throw new ApiError(409, "Already enrolled");
    const enrollment = await Enrollment.create({ userId: actor.id, courseId });

    const course = await Course.findById(courseId);
    await logActivity({
      type: "enrollment_created",
      message: `${actor.name} enrolled in ${course?.title ?? "a course"}`,
      actorId: actor.id,
      actorName: actor.name,
      region: actor.region,
      scope: "global",
    });

    res.status(201).json({ enrollment });
  })
);

router.patch(
  "/:id/progress",
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const progress = z.number().min(0).max(100).parse(req.body.progress);
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) throw new ApiError(404, "Enrollment not found");
    if (String(enrollment.userId) !== String(actor.id) && actor.role !== "super_admin") {
      throw new ApiError(403, "Not authorized");
    }

    enrollment.progress = progress;
    if (progress >= 100 && enrollment.status !== "completed") {
      enrollment.status = "completed";
      enrollment.completedAt = new Date();
      await Certificate.findOneAndUpdate(
        { userId: enrollment.userId, courseId: enrollment.courseId },
        { userId: enrollment.userId, courseId: enrollment.courseId },
        { upsert: true, setDefaultsOnInsert: true }
      );

      const course = await Course.findById(enrollment.courseId);
      await logActivity({
        type: "enrollment_completed",
        message: `${actor.name} completed ${course?.title ?? "a course"} — certificate issued`,
        actorId: actor.id,
        actorName: actor.name,
        region: actor.region,
        scope: "global",
      });
    }
    await enrollment.save();
    res.json({ enrollment });
  })
);

export default router;
