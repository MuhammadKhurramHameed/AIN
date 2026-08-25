import { Router } from "express";
import { z } from "zod";
import { Cohort } from "../models/Cohort";
import { Course } from "../models/Course";
import { Track } from "../models/Track";
import { Programme } from "../models/Programme";
import { User } from "../models/User";
import { Enrollment } from "../models/Enrollment";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const router = Router();
router.use(requireAuth);

const MANAGE_ROLES = ["super_admin", "moitt_staff", "content_admin"] as const;

/** Checks assigned trainers against the programme's configured eligibility rule. Returns warnings, never blocks — staff make the final call. */
async function checkTrainerEligibility(courseId: string, trainerIds: string[]): Promise<string[]> {
  if (trainerIds.length === 0) return [];
  const course = await Course.findById(courseId).select("trackId");
  if (!course) return [];
  const track = await Track.findById(course.trackId).select("programmeId");
  if (!track) return [];
  const programme = await Programme.findById(track.programmeId).select("minTrainerEducationYears minTrainerExperienceYears");
  if (!programme) return [];

  const trainers = await User.find({ _id: { $in: trainerIds } }).select("name educationYears experienceYears");
  const warnings: string[] = [];
  for (const t of trainers) {
    const edu = t.educationYears ?? 0;
    const exp = t.experienceYears ?? 0;
    if (edu < programme.minTrainerEducationYears || exp < programme.minTrainerExperienceYears) {
      warnings.push(
        `${t.name} does not meet this programme's trainer eligibility (needs ${programme.minTrainerEducationYears}yrs education / ${programme.minTrainerExperienceYears}yrs experience; profile shows ${edu || "unset"}/${exp || "unset"}).`
      );
    }
  }
  return warnings;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const filter: Record<string, unknown> = {};
    if (req.query.courseId) filter.courseId = req.query.courseId;
    if (actor.role === "tutor") filter.trainerIds = actor.id;

    let cohortIds: string[] | undefined;
    if (actor.role === "trainee") {
      const myEnrollments = await Enrollment.find({ userId: actor.id, cohortId: { $exists: true } }).select("cohortId");
      cohortIds = myEnrollments.map((e) => String(e.cohortId));
      filter._id = { $in: cohortIds };
    }

    const cohorts = await Cohort.find(filter).populate("courseId", "title").populate("trainerIds", "name email").sort({ startDate: -1 });
    res.json({ cohorts });
  })
);

const cohortSchema = z.object({
  courseId: z.string(),
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  trainerIds: z.array(z.string()).default([]),
  maxSize: z.number().min(1).optional(),
});

router.post(
  "/",
  requireRole(...MANAGE_ROLES),
  asyncHandler(async (req, res) => {
    const body = cohortSchema.parse(req.body);
    const warnings = await checkTrainerEligibility(body.courseId, body.trainerIds);
    const cohort = await Cohort.create({ ...body, createdBy: req.user!.id });
    res.status(201).json({ cohort, warnings });
  })
);

router.patch(
  "/:id",
  requireRole(...MANAGE_ROLES),
  asyncHandler(async (req, res) => {
    const body = cohortSchema
      .partial()
      .extend({ status: z.enum(["planned", "active", "completed", "cancelled"]).optional() })
      .parse(req.body);
    const existing = await Cohort.findById(req.params.id);
    if (!existing) throw new ApiError(404, "Cohort not found");

    let warnings: string[] = [];
    if (body.trainerIds) {
      warnings = await checkTrainerEligibility(String(body.courseId ?? existing.courseId), body.trainerIds);
    }

    const cohort = await Cohort.findByIdAndUpdate(req.params.id, body, { new: true });
    res.json({ cohort, warnings });
  })
);

router.get(
  "/:id/trainees",
  asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({ cohortId: req.params.id }).populate("userId", "name email gender region");
    res.json({ enrollments });
  })
);

router.post(
  "/:id/trainees",
  requireRole(...MANAGE_ROLES),
  asyncHandler(async (req, res) => {
    const cohort = await Cohort.findById(req.params.id);
    if (!cohort) throw new ApiError(404, "Cohort not found");
    const userIds = z.array(z.string()).min(1).parse(req.body.userIds);

    const validTrainees = await User.find({ _id: { $in: userIds }, role: "trainee" }).select("_id");
    if (validTrainees.length !== userIds.length) {
      throw new ApiError(400, "One or more userIds don't refer to an existing trainee");
    }

    if (cohort.maxSize) {
      const currentSize = await Enrollment.countDocuments({ cohortId: cohort.id });
      if (currentSize + userIds.length > cohort.maxSize) {
        throw new ApiError(400, `Adding ${userIds.length} trainees would exceed this cohort's max size of ${cohort.maxSize}`);
      }
    }

    let added = 0;
    for (const userId of userIds) {
      const result = await Enrollment.findOneAndUpdate(
        { userId, courseId: cohort.courseId },
        { userId, courseId: cohort.courseId, cohortId: cohort.id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (result) added += 1;
    }
    res.json({ ok: true, added });
  })
);

router.delete(
  "/:id/trainees/:userId",
  requireRole(...MANAGE_ROLES),
  asyncHandler(async (req, res) => {
    await Enrollment.updateOne({ cohortId: req.params.id, userId: req.params.userId }, { $unset: { cohortId: 1 } });
    res.json({ ok: true });
  })
);

export default router;
