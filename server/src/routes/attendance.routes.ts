import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { AttendanceSession } from "../models/AttendanceSession";
import { AttendanceRecord } from "../models/AttendanceRecord";
import { Cohort } from "../models/Cohort";
import { Enrollment } from "../models/Enrollment";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const STAFF_MANAGE_ROLES = ["super_admin", "moitt_staff", "content_admin"];

async function assertCanManageCohort(cohortId: string, actorId: string, actorRole: string): Promise<InstanceType<typeof Cohort>> {
  const cohort = await Cohort.findById(cohortId);
  if (!cohort) throw new ApiError(404, "Cohort not found");
  const isAssignedTrainer = cohort.trainerIds.some((t) => String(t) === actorId);
  if (!isAssignedTrainer && !STAFF_MANAGE_ROLES.includes(actorRole)) {
    throw new ApiError(403, "Not authorized for this cohort");
  }
  return cohort;
}

router.get(
  "/sessions",
  asyncHandler(async (req, res) => {
    const cohortId = z.string().parse(req.query.cohortId);
    const sessions = await AttendanceSession.find({ cohortId }).sort({ date: -1 });
    res.json({ sessions });
  })
);

const sessionSchema = z.object({
  cohortId: z.string(),
  date: z.string(),
  topic: z.string().optional(),
});

router.post(
  "/sessions",
  asyncHandler(async (req, res) => {
    const body = sessionSchema.parse(req.body);
    await assertCanManageCohort(body.cohortId, req.user!.id, req.user!.role);
    const session = await AttendanceSession.create({ ...body, createdBy: req.user!.id });
    res.status(201).json({ session });
  })
);

router.get(
  "/sessions/:id/records",
  asyncHandler(async (req, res) => {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) throw new ApiError(404, "Session not found");
    const [records, roster] = await Promise.all([
      AttendanceRecord.find({ sessionId: session.id }),
      Enrollment.find({ cohortId: session.cohortId }).populate("userId", "name email"),
    ]);
    const recordByUser = new Map(records.map((r) => [String(r.userId), r.status]));
    res.json({
      roster: roster.map((e) => ({
        userId: typeof e.userId === "object" ? (e.userId as unknown as { _id: string })._id : e.userId,
        name: (e.userId as unknown as { name?: string })?.name,
        email: (e.userId as unknown as { email?: string })?.email,
        status: recordByUser.get(String(e.userId)) ?? null,
      })),
    });
  })
);

const markSchema = z.object({
  records: z.array(z.object({ userId: z.string(), status: z.enum(["present", "absent", "late", "excused"]) })).min(1),
});

router.post(
  "/sessions/:id/mark",
  asyncHandler(async (req, res) => {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) throw new ApiError(404, "Session not found");
    await assertCanManageCohort(String(session.cohortId), req.user!.id, req.user!.role);

    const body = markSchema.parse(req.body);
    for (const r of body.records) {
      await AttendanceRecord.findOneAndUpdate(
        { sessionId: session.id, userId: r.userId },
        { sessionId: session.id, cohortId: session.cohortId, userId: r.userId, status: r.status, markedBy: req.user!.id, markedAt: new Date() },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
    res.json({ ok: true, marked: body.records.length });
  })
);

router.get(
  "/cohorts/:cohortId/summary",
  asyncHandler(async (req, res) => {
    const cohortId = req.params.cohortId;
    const [totalSessions, byUser] = await Promise.all([
      AttendanceSession.countDocuments({ cohortId }),
      AttendanceRecord.aggregate([
        { $match: { cohortId: new mongoose.Types.ObjectId(cohortId) } },
        { $group: { _id: "$userId", present: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } }, total: { $sum: 1 } } },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $project: { name: "$user.name", present: 1, total: 1, _id: 0 } },
      ]),
    ]);
    const data = byUser.map((u) => ({ ...u, attendancePct: totalSessions > 0 ? Math.round((u.present / totalSessions) * 100) : 0 }));
    res.json({ totalSessions, data });
  })
);

export default router;
