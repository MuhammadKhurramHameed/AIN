import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { User } from "../models/User";
import { Track } from "../models/Track";
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import { ConsortiumPartner } from "../models/ConsortiumPartner";
import { Report } from "../models/Report";
import { KanbanCard } from "../models/KanbanCard";
import { QuizAttempt } from "../models/QuizAttempt";
import { Quiz } from "../models/Quiz";
import { Lesson } from "../models/Lesson";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { STAFF_ACTIVITY_ROLES as staffRoles } from "../config/roles";

const router = Router();
router.use(requireAuth);

/**
 * Every dashboard metric ultimately traces back to Track (which now carries programmeId).
 * Resolving a programme filter once, here, into the concrete set of trackIds/courseIds it
 * covers lets every endpoint below scope its query without repeating the Track->Course walk.
 * Returns null for "no filter" (the pre-multi-programme, all-programmes rollup).
 *
 * ConsortiumPartner/Report/KanbanCard are NOT scoped — they aren't linked to a Track or
 * Programme in the schema (a partner or a Kanban board isn't owned by one programme today),
 * so partner-performance, reports-pending, and kanban tiles stay programme-agnostic regardless
 * of the selected filter. That's a real, tracked gap (see PROG-002 in the traceability matrix),
 * not an oversight.
 */
async function getProgrammeScope(programmeId?: string): Promise<{ trackIds: mongoose.Types.ObjectId[]; courseIds: mongoose.Types.ObjectId[] } | null> {
  if (!programmeId) return null;
  const tracks = await Track.find({ programmeId }).select("_id").lean();
  const trackIds = tracks.map((t) => t._id as mongoose.Types.ObjectId);
  const courses = await Course.find({ trackId: { $in: trackIds } }).select("_id").lean();
  const courseIds = courses.map((c) => c._id as mongoose.Types.ObjectId);
  return { trackIds, courseIds };
}

function programmeIdFromQuery(req: { query: Record<string, unknown> }): string | undefined {
  const v = req.query.programmeId;
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

router.get(
  "/overview",
  requireRole(...staffRoles),
  asyncHandler(async (req, res) => {
    const scope = await getProgrammeScope(programmeIdFromQuery(req));
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const traineeFilter = scope ? { role: "trainee", trackId: { $in: scope.trackIds } } : { role: "trainee" };
    const enrollmentScope = scope ? { courseId: { $in: scope.courseIds } } : {};

    async function countScopedTutors(): Promise<number> {
      if (!scope) return User.countDocuments({ role: "tutor" });
      const courses = await Course.find({ _id: { $in: scope.courseIds } }).select("tutors").lean();
      const set = new Set<string>();
      for (const c of courses) for (const t of c.tutors) set.add(String(t));
      return set.size;
    }

    async function countScopedQuizAttempts(): Promise<number> {
      if (!scope) return QuizAttempt.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
      const lessons = await Lesson.find({ courseId: { $in: scope.courseIds } }).select("_id").lean();
      const quizzes = await Quiz.find({ lessonId: { $in: lessons.map((l) => l._id) } }).select("_id").lean();
      return QuizAttempt.countDocuments({ quizId: { $in: quizzes.map((q) => q._id) }, createdAt: { $gte: sevenDaysAgo } });
    }

    const [
      totalTrainees,
      totalCompletedEnrollments,
      totalEnrollments,
      activeTracks,
      trainerCount,
      activePartners,
      femaleTrainees,
      activeTraineesToday,
      newEnrollmentsThisWeek,
      quizAttemptsThisWeek,
      reportsPendingReview,
      kanbanOpenCards,
      kanbanDoneCards,
    ] = await Promise.all([
      User.countDocuments(traineeFilter),
      Enrollment.countDocuments({ ...enrollmentScope, status: "completed" }),
      Enrollment.countDocuments(enrollmentScope),
      scope ? Track.countDocuments({ _id: { $in: scope.trackIds } }) : Track.countDocuments({}),
      countScopedTutors(),
      ConsortiumPartner.countDocuments({ status: "active" }),
      User.countDocuments({ ...traineeFilter, gender: "female" }),
      Enrollment.distinct("userId", { ...enrollmentScope, updatedAt: { $gte: startOfToday } }).then((ids) => ids.length),
      Enrollment.countDocuments({ ...enrollmentScope, createdAt: { $gte: sevenDaysAgo } }),
      countScopedQuizAttempts(),
      Report.countDocuments({ status: "submitted" }),
      KanbanCard.countDocuments({ columnId: { $ne: "done" } }),
      KanbanCard.countDocuments({ columnId: "done" }),
    ]);

    const completionRate = totalEnrollments > 0 ? Math.round((totalCompletedEnrollments / totalEnrollments) * 100) : 0;
    const femalePct = totalTrainees > 0 ? Math.round((femaleTrainees / totalTrainees) * 100) : 0;

    res.json({
      totalTrainees,
      completionRate,
      femalePct,
      activeTracks,
      trainerCount,
      activePartners,
      activeTraineesToday,
      newEnrollmentsThisWeek,
      quizAttemptsThisWeek,
      reportsPendingReview,
      kanbanOpenCards,
      kanbanDoneCards,
    });
  })
);

/**
 * Enrolled/completed counts grouped by courseId, with no $lookup against Enrollment
 * (which can hold tens of thousands of rows at full programme scale). Course and Track
 * are tiny, near-static tables, so it's far cheaper to pull them into memory once and
 * roll the per-course counts up to per-track / per-level in Node than to join a large
 * fact collection against them inside the aggregation pipeline.
 */
async function getPerCourseEnrollmentCounts(opts: { userIds?: mongoose.Types.ObjectId[]; courseIds?: mongoose.Types.ObjectId[] } = {}) {
  const match: Record<string, unknown> = {};
  if (opts.userIds) match.userId = { $in: opts.userIds };
  if (opts.courseIds) match.courseId = { $in: opts.courseIds };
  const matchStage = Object.keys(match).length > 0 ? [{ $match: match }] : [];

  const [courses, counts] = await Promise.all([
    Course.find(opts.courseIds ? { _id: { $in: opts.courseIds } } : {})
      .select("trackId level")
      .populate("trackId", "name")
      .lean(),
    Enrollment.aggregate([
      ...matchStage,
      {
        $group: {
          _id: "$courseId",
          enrolled: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        },
      },
    ]),
  ]);
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));
  return { counts, courseMap };
}

router.get(
  "/level-breakdown",
  requireRole(...staffRoles),
  asyncHandler(async (req, res) => {
    const scope = await getProgrammeScope(programmeIdFromQuery(req));
    const { counts, courseMap } = await getPerCourseEnrollmentCounts(scope ? { courseIds: scope.courseIds } : {});
    const byLevel = new Map<string, { enrolled: number; completed: number }>();
    for (const row of counts) {
      const course = courseMap.get(String(row._id));
      if (!course) continue;
      const agg = byLevel.get(course.level) ?? { enrolled: 0, completed: 0 };
      agg.enrolled += row.enrolled;
      agg.completed += row.completed;
      byLevel.set(course.level, agg);
    }
    const data = Array.from(byLevel.entries())
      .map(([level, v]) => ({ level, ...v, completionRate: v.enrolled > 0 ? Math.round((v.completed / v.enrolled) * 100) : 0 }))
      .sort((a, b) => a.level.localeCompare(b.level));
    res.json({ data });
  })
);

router.get(
  "/enrollment-by-track",
  requireRole(...staffRoles),
  asyncHandler(async (req, res) => {
    const scope = await getProgrammeScope(programmeIdFromQuery(req));
    const { counts, courseMap } = await getPerCourseEnrollmentCounts(scope ? { courseIds: scope.courseIds } : {});
    const byTrack = new Map<string, { enrolled: number; completed: number }>();
    for (const row of counts) {
      const course = courseMap.get(String(row._id));
      const trackName = (course?.trackId as unknown as { name?: string } | undefined)?.name;
      if (!trackName) continue;
      const agg = byTrack.get(trackName) ?? { enrolled: 0, completed: 0 };
      agg.enrolled += row.enrolled;
      agg.completed += row.completed;
      byTrack.set(trackName, agg);
    }
    const data = Array.from(byTrack.entries())
      .map(([track, v]) => ({ track, ...v }))
      .sort((a, b) => a.track.localeCompare(b.track));
    res.json({ data });
  })
);

router.get(
  "/regional-density",
  requireRole(...staffRoles),
  asyncHandler(async (req, res) => {
    const scope = await getProgrammeScope(programmeIdFromQuery(req));
    const match: Record<string, unknown> = { role: "trainee", region: { $exists: true } };
    if (scope) match.trackId = { $in: scope.trackIds };
    const data = await User.aggregate([
      { $match: match },
      { $group: { _id: "$region", trainees: { $sum: 1 } } },
      { $project: { region: "$_id", trainees: 1, _id: 0 } },
      { $sort: { trainees: -1 } },
    ]);
    res.json({ data });
  })
);

/**
 * Per-region drill-down (a "sub-matrix": trainee headcount + completion rate broken
 * down by track, within one region), fetched lazily only when a decision-maker expands
 * that region's tile — full-strength scale means we should not compute all 7 up front.
 */
router.get(
  "/regional-detail",
  requireRole(...staffRoles),
  asyncHandler(async (req, res) => {
    const region = z.string().min(1).parse(req.query.region);
    const scope = await getProgrammeScope(programmeIdFromQuery(req));

    const traineeFilter: Record<string, unknown> = { role: "trainee", region };
    if (scope) traineeFilter.trackId = { $in: scope.trackIds };
    const traineesInRegion = await User.find(traineeFilter).select("_id trackId gender").lean();
    if (traineesInRegion.length === 0) {
      return res.json({ region, trainees: 0, femalePct: 0, completionRate: 0, byTrack: [] });
    }

    const traineeIds = traineesInRegion.map((t) => t._id as mongoose.Types.ObjectId);
    const female = traineesInRegion.filter((t) => t.gender === "female").length;

    const tracks = await Track.find().select("name").lean();
    const trackNameById = new Map(tracks.map((t) => [String(t._id), t.name]));

    const headcountByTrack = new Map<string, number>();
    for (const t of traineesInRegion) {
      const trackName = t.trackId ? trackNameById.get(String(t.trackId)) : undefined;
      if (!trackName) continue;
      headcountByTrack.set(trackName, (headcountByTrack.get(trackName) ?? 0) + 1);
    }

    const { counts, courseMap } = await getPerCourseEnrollmentCounts({
      userIds: traineeIds,
      courseIds: scope?.courseIds,
    });
    const enrollmentByTrack = new Map<string, { enrolled: number; completed: number }>();
    let totalEnrolled = 0;
    let totalCompleted = 0;
    for (const row of counts) {
      const course = courseMap.get(String(row._id));
      const trackName = (course?.trackId as unknown as { name?: string } | undefined)?.name;
      if (!trackName) continue;
      const agg = enrollmentByTrack.get(trackName) ?? { enrolled: 0, completed: 0 };
      agg.enrolled += row.enrolled;
      agg.completed += row.completed;
      enrollmentByTrack.set(trackName, agg);
      totalEnrolled += row.enrolled;
      totalCompleted += row.completed;
    }

    const byTrack = Array.from(headcountByTrack.entries())
      .map(([track, trainees]) => {
        const e = enrollmentByTrack.get(track) ?? { enrolled: 0, completed: 0 };
        return {
          track,
          trainees,
          completionRate: e.enrolled > 0 ? Math.round((e.completed / e.enrolled) * 100) : 0,
        };
      })
      .sort((a, b) => b.trainees - a.trainees);

    res.json({
      region,
      trainees: traineesInRegion.length,
      femalePct: Math.round((female / traineesInRegion.length) * 100),
      completionRate: totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0,
      byTrack,
    });
  })
);

router.get(
  "/gender-split",
  requireRole(...staffRoles),
  asyncHandler(async (req, res) => {
    const scope = await getProgrammeScope(programmeIdFromQuery(req));
    const match: Record<string, unknown> = { role: "trainee" };
    if (scope) match.trackId = { $in: scope.trackIds };
    const data = await User.aggregate([
      { $match: match },
      { $group: { _id: { $ifNull: ["$gender", "unspecified"] }, count: { $sum: 1 } } },
      { $project: { gender: "$_id", count: 1, _id: 0 } },
    ]);
    res.json({ data });
  })
);

router.get(
  "/completion-trend",
  requireRole(...staffRoles),
  asyncHandler(async (req, res) => {
    const scope = await getProgrammeScope(programmeIdFromQuery(req));
    const match: Record<string, unknown> = { status: "completed", completedAt: { $ne: null } };
    if (scope) match.courseId = { $in: scope.courseIds };
    const data = await Enrollment.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$completedAt" } },
          completed: { $sum: 1 },
        },
      },
      { $project: { month: "$_id", completed: 1, _id: 0 } },
      { $sort: { month: 1 } },
    ]);
    res.json({ data });
  })
);

// Not programme-scoped: ConsortiumPartner/Report have no Track/Programme link in the schema.
router.get(
  "/partner-performance",
  requireRole("super_admin", "moitt_staff", "consortium_partner_admin"),
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const match: Record<string, unknown> = {};
    if (actor.role === "consortium_partner_admin") {
      match.partnerId = new mongoose.Types.ObjectId(String(actor.organizationId));
    }
    const data = await Report.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$partnerId",
          enrolled: { $sum: "$metrics.enrolled" },
          completed: { $sum: "$metrics.completed" },
          dropouts: { $sum: "$metrics.dropouts" },
          avgFemalePct: { $avg: "$metrics.femalePct" },
        },
      },
      { $lookup: { from: "consortiumpartners", localField: "_id", foreignField: "_id", as: "partner" } },
      { $unwind: "$partner" },
      {
        $project: {
          partner: "$partner.name",
          enrolled: 1,
          completed: 1,
          dropouts: 1,
          avgFemalePct: { $round: ["$avgFemalePct", 0] },
          _id: 0,
        },
      },
      { $sort: { enrolled: -1 } },
    ]);
    res.json({ data });
  })
);

// Not programme-scoped: KanbanCard boards aren't owned by a single programme.
router.get(
  "/kanban-throughput",
  requireRole(...staffRoles),
  asyncHandler(async (_req, res) => {
    const data = await KanbanCard.aggregate([
      { $match: { columnId: "done" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          completed: { $sum: 1 },
        },
      },
      { $project: { day: "$_id", completed: 1, _id: 0 } },
      { $sort: { day: 1 } },
      { $limit: 30 },
    ]);
    res.json({ data });
  })
);

async function getCourseMeta(courseIds?: mongoose.Types.ObjectId[]) {
  const courses = await Course.find(courseIds ? { _id: { $in: courseIds } } : {})
    .select("trackId level")
    .populate("trackId", "name")
    .lean();
  return new Map(courses.map((c) => [String(c._id), c]));
}

/**
 * Lazy, per-tile drill-downs for the dashboard's clickable stat tiles — computed only
 * when a decision-maker actually opens that tile's popup, not pre-fetched for all of them.
 * "kanban" stays unscoped (see the /kanban-throughput note above).
 */
router.get(
  "/tile-detail",
  requireRole(...staffRoles),
  asyncHandler(async (req, res) => {
    const tile = z.enum(["tutors", "engagement", "quiz", "kanban"]).parse(req.query.tile);
    const scope = await getProgrammeScope(programmeIdFromQuery(req));

    if (tile === "tutors") {
      const courses = await Course.find(scope ? { _id: { $in: scope.courseIds } } : {})
        .select("trackId tutors")
        .populate("trackId", "name")
        .lean();
      const byTrack = new Map<string, Set<string>>();
      for (const c of courses) {
        const trackName = (c.trackId as unknown as { name?: string } | undefined)?.name;
        if (!trackName) continue;
        const set = byTrack.get(trackName) ?? new Set<string>();
        for (const t of c.tutors) set.add(String(t));
        byTrack.set(trackName, set);
      }
      const data = Array.from(byTrack.entries())
        .map(([track, set]) => ({ track, tutors: set.size }))
        .sort((a, b) => b.tutors - a.tutors);
      return res.json({ data });
    }

    if (tile === "engagement") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const courseMeta = await getCourseMeta(scope?.courseIds);

      const rollUp = async (match: Record<string, unknown>) => {
        const scopedMatch = scope ? { ...match, courseId: { $in: scope.courseIds } } : match;
        const counts = await Enrollment.aggregate([{ $match: scopedMatch }, { $group: { _id: "$courseId", count: { $sum: 1 } } }]);
        const byTrack = new Map<string, number>();
        for (const row of counts) {
          const trackName = (courseMeta.get(String(row._id))?.trackId as unknown as { name?: string } | undefined)?.name;
          if (!trackName) continue;
          byTrack.set(trackName, (byTrack.get(trackName) ?? 0) + row.count);
        }
        return Array.from(byTrack.entries())
          .map(([track, count]) => ({ track, count }))
          .sort((a, b) => b.count - a.count);
      };

      const [activeTodayByTrack, newEnrollmentsByTrack] = await Promise.all([
        rollUp({ updatedAt: { $gte: startOfToday } }),
        rollUp({ createdAt: { $gte: sevenDaysAgo } }),
      ]);
      return res.json({ activeTodayByTrack, newEnrollmentsByTrack });
    }

    if (tile === "quiz") {
      let quizIdFilter: mongoose.Types.ObjectId[] | undefined;
      if (scope) {
        const lessons = await Lesson.find({ courseId: { $in: scope.courseIds } }).select("_id").lean();
        const quizzes = await Quiz.find({ lessonId: { $in: lessons.map((l) => l._id) } }).select("_id").lean();
        quizIdFilter = quizzes.map((q) => q._id as mongoose.Types.ObjectId);
      }
      const attempts = await QuizAttempt.aggregate([
        ...(quizIdFilter ? [{ $match: { quizId: { $in: quizIdFilter } } }] : []),
        { $group: { _id: "$quizId", attempts: { $sum: 1 }, passed: { $sum: { $cond: ["$passed", 1, 0] } } } },
      ]);
      if (attempts.length === 0) return res.json({ data: [] });

      const quizzes = await Quiz.find({ _id: { $in: attempts.map((a) => a._id) } }).select("lessonId title").lean();
      const lessons = await Lesson.find({ _id: { $in: quizzes.map((q) => q.lessonId) } }).select("courseId").lean();
      const courses = await Course.find({ _id: { $in: lessons.map((l) => l.courseId) } }).select("title").lean();
      const lessonById = new Map(lessons.map((l) => [String(l._id), l]));
      const courseById = new Map(courses.map((c) => [String(c._id), c]));
      const quizById = new Map(quizzes.map((q) => [String(q._id), q]));

      const data = attempts.map((a) => {
        const quiz = quizById.get(String(a._id));
        const lesson = quiz ? lessonById.get(String(quiz.lessonId)) : undefined;
        const course = lesson ? courseById.get(String(lesson.courseId)) : undefined;
        return {
          quiz: quiz?.title ?? "Quiz",
          course: course?.title ?? "—",
          attempts: a.attempts,
          passRate: a.attempts > 0 ? Math.round((a.passed / a.attempts) * 100) : 0,
        };
      });
      return res.json({ data });
    }

    // kanban
    const cards = await KanbanCard.find().select("columnId assigneeId").populate("assigneeId", "name").lean();
    const byAssignee = new Map<string, { open: number; done: number }>();
    for (const c of cards) {
      const name = (c.assigneeId as unknown as { name?: string } | undefined)?.name ?? "Unassigned";
      const agg = byAssignee.get(name) ?? { open: 0, done: 0 };
      if (c.columnId === "done") agg.done += 1;
      else agg.open += 1;
      byAssignee.set(name, agg);
    }
    const data = Array.from(byAssignee.entries())
      .map(([assignee, v]) => ({ assignee, ...v }))
      .sort((a, b) => b.open + b.done - (a.open + a.done));
    return res.json({ data });
  })
);

export default router;
