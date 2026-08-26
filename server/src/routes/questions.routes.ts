import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { Question } from "../models/Question";
import { Course } from "../models/Course";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { parsePagination, paginationMeta } from "../utils/pagination";
import { toCsv, sendCsv } from "../utils/csv";
import { logAudit } from "../utils/audit";

const router = Router();
router.use(requireAuth);

const MANAGE_ROLES = ["super_admin", "moitt_staff", "content_admin"] as const;
const VIEW_ROLES = [...MANAGE_ROLES, "content_reviewer"] as const;

router.get(
  "/",
  requireRole(...VIEW_ROLES),
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = {};
    if (req.query.courseId) filter.courseId = req.query.courseId;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (typeof req.query.q === "string" && req.query.q.trim().length > 0) {
      filter.text = new RegExp(req.query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    }

    const pagination = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
    const [questions, total] = await Promise.all([
      Question.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
      Question.countDocuments(filter),
    ]);
    res.json({ questions, ...paginationMeta(total, pagination) });
  })
);

const EXPORT_ROW_CAP = 20_000;

router.get(
  "/export",
  requireRole(...VIEW_ROLES),
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = {};
    if (req.query.courseId) filter.courseId = req.query.courseId;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.type) filter.type = req.query.type;

    const questions = await Question.find(filter).sort({ createdAt: -1 }).limit(EXPORT_ROW_CAP).lean();
    const courses = await Course.find({ _id: { $in: [...new Set(questions.map((q) => String(q.courseId)))] } })
      .select("title")
      .lean();
    const courseTitleById = new Map(courses.map((c) => [String(c._id), c.title]));

    const csv = toCsv(questions, [
      { header: "Course", value: (q) => courseTitleById.get(String(q.courseId)) ?? String(q.courseId) },
      { header: "Text", value: (q) => q.text },
      { header: "Type", value: (q) => q.type },
      { header: "Options", value: (q) => q.options.map((o) => o.text).join("|") },
      {
        header: "Correct answers",
        value: (q) => q.options.filter((o) => q.correctOptionIds.includes(o.id)).map((o) => o.text).join("|"),
      },
      { header: "Sample answer", value: (q) => q.sampleAnswer ?? "" },
      { header: "Difficulty", value: (q) => q.difficulty },
      { header: "Bloom level", value: (q) => q.bloomLevel },
      { header: "Tags", value: (q) => q.tags.join(",") },
      { header: "Status", value: (q) => q.status },
    ]);

    await logAudit({ action: "questions_exported", actor: req.user!, req, success: true, metadata: { count: questions.length, filter: req.query } });
    sendCsv(res, `question-bank-export-${Date.now()}.csv`, csv);
  })
);

const optionSchema = z.object({ id: z.string().optional(), text: z.string().min(1) });

const questionSchema = z.object({
  courseId: z.string(),
  text: z.string().min(1),
  type: z.enum(["mcq", "multi_select", "true_false", "short_answer"]),
  options: z.array(optionSchema).default([]),
  correctOptionIds: z.array(z.string()).default([]),
  sampleAnswer: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  bloomLevel: z.enum(["remember", "understand", "apply", "analyze", "evaluate", "create"]).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "approved"]).optional(),
});

router.post(
  "/",
  requireRole(...MANAGE_ROLES),
  asyncHandler(async (req, res) => {
    const body = questionSchema.parse(req.body);
    if (body.type !== "short_answer" && body.correctOptionIds.length === 0) {
      throw new ApiError(400, "Objective questions need at least one correct option");
    }
    const question = await Question.create({ ...body, createdBy: req.user!.id });
    res.status(201).json({ question });
  })
);

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

const bulkRowSchema = z.object({
  course: z.string().min(1), // course _id, or its title (resolved against this org's courses)
  text: z.string().min(1),
  type: z.enum(["mcq", "multi_select", "true_false", "short_answer"]),
  options: z.string().optional(), // pipe-separated option text, e.g. "Python|HTML|JavaScript"
  correctAnswers: z.string().optional(), // pipe-separated, must match entries in `options` by text
  sampleAnswer: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  bloomLevel: z.enum(["remember", "understand", "apply", "analyze", "evaluate", "create"]).optional(),
  tags: z.string().optional(), // comma-separated
  status: z.enum(["draft", "approved"]).optional(),
});

const bulkSchema = z.object({ questions: z.array(z.record(z.unknown())).min(1).max(2000) });

// Bulk create (CSV import). Course is matched by id or by exact title so a content author
// can build the CSV from what they see in the UI without knowing internal ObjectIds. Each
// row is validated independently — a typo in row 40 doesn't lose rows 1-39.
router.post(
  "/bulk",
  requireRole(...MANAGE_ROLES),
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const { questions: rows } = bulkSchema.parse(req.body);

    const allCourses = await Course.find().select("title").lean();
    const courseById = new Map(allCourses.map((c) => [String(c._id), c]));
    const courseByTitle = new Map(allCourses.map((c) => [c.title.trim().toLowerCase(), c]));

    const results: { row: number; status: "created" | "skipped"; reason?: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 1;
      const parsed = bulkRowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        results.push({ row: rowNum, status: "skipped", reason: parsed.error.issues.map((iss) => iss.message).join("; ") });
        continue;
      }
      const row = parsed.data;

      const course = OBJECT_ID_RE.test(row.course) ? courseById.get(row.course) : courseByTitle.get(row.course.trim().toLowerCase());
      if (!course) {
        results.push({ row: rowNum, status: "skipped", reason: `Course "${row.course}" not found (checked by id and by exact title)` });
        continue;
      }

      let options: { id: string; text: string }[] = [];
      let correctOptionIds: string[] = [];
      if (row.type === "true_false") {
        options = [{ id: "true", text: "True" }, { id: "false", text: "False" }];
        const correct = (row.correctAnswers ?? "").trim().toLowerCase();
        correctOptionIds = correct.startsWith("t") ? ["true"] : correct.startsWith("f") ? ["false"] : [];
      } else if (row.type !== "short_answer") {
        const optionTexts = (row.options ?? "").split("|").map((t) => t.trim()).filter(Boolean);
        options = optionTexts.map((text) => ({ id: crypto.randomBytes(6).toString("hex"), text }));
        const correctTexts = new Set(
          (row.correctAnswers ?? "").split("|").map((t) => t.trim().toLowerCase()).filter(Boolean)
        );
        correctOptionIds = options.filter((o) => correctTexts.has(o.text.toLowerCase())).map((o) => o.id);
      }

      if (row.type !== "short_answer" && correctOptionIds.length === 0) {
        results.push({ row: rowNum, status: "skipped", reason: "Objective questions need at least one correct option — check `options`/`correctAnswers` match" });
        continue;
      }

      await Question.create({
        courseId: course._id,
        text: row.text,
        type: row.type,
        options,
        correctOptionIds,
        sampleAnswer: row.sampleAnswer,
        difficulty: row.difficulty,
        bloomLevel: row.bloomLevel,
        tags: row.tags ? row.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        status: row.status,
        createdBy: actor.id,
      });
      results.push({ row: rowNum, status: "created" });
    }

    const createdCount = results.filter((r) => r.status === "created").length;
    await logAudit({
      action: "questions_bulk_imported",
      actor,
      req,
      success: true,
      metadata: { attempted: rows.length, created: createdCount, skipped: rows.length - createdCount },
    });

    res.status(201).json({ results, created: createdCount, skipped: rows.length - createdCount });
  })
);

router.patch(
  "/:id",
  requireRole(...MANAGE_ROLES),
  asyncHandler(async (req, res) => {
    const body = questionSchema.partial().parse(req.body);
    const question = await Question.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!question) throw new ApiError(404, "Question not found");
    res.json({ question });
  })
);

router.delete(
  "/:id",
  requireRole(...MANAGE_ROLES),
  asyncHandler(async (req, res) => {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  })
);

export default router;
