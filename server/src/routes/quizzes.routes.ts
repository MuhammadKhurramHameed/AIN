import { Router } from "express";
import { z } from "zod";
import { Quiz } from "../models/Quiz";
import { QuizAttempt, ISnapshotQuestion } from "../models/QuizAttempt";
import { Question } from "../models/Question";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const router = Router();
router.use(requireAuth);

const MANAGE_ROLES = ["super_admin", "moitt_staff", "content_admin"] as const;
const TIME_GRACE_MS = 30_000;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const lessonId = z.string().parse(req.query.lessonId);
    const quiz = await Quiz.findOne({ lessonId });
    if (!quiz) return res.json({ quiz: null });

    const actor = req.user!;
    if (MANAGE_ROLES.includes(actor.role as (typeof MANAGE_ROLES)[number])) {
      return res.json({ quiz });
    }

    // Trainee: metadata only — no question content until they explicitly start an attempt.
    const [attemptsUsed, inProgress] = await Promise.all([
      QuizAttempt.countDocuments({ userId: actor.id, quizId: quiz.id, status: "submitted" }),
      QuizAttempt.findOne({ userId: actor.id, quizId: quiz.id, status: "in_progress" }),
    ]);

    res.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        passScore: quiz.passScore,
        timeLimitMinutes: quiz.timeLimitMinutes,
        maxAttempts: quiz.maxAttempts,
        attemptsUsed,
        questionCount: quiz.questionBankIds.length > 0 ? quiz.questionCount ?? quiz.questionBankIds.length : quiz.questions.length,
        inProgressAttemptId: inProgress?.id,
      },
    });
  })
);

const quizSchema = z.object({
  lessonId: z.string(),
  title: z.string().min(1),
  passScore: z.number().optional(),
  questions: z
    .array(z.object({ text: z.string().min(1), options: z.array(z.string()).min(2), correctIndex: z.number().min(0) }))
    .optional(),
  questionBankIds: z.array(z.string()).optional(),
  questionCount: z.number().min(1).optional(),
  timeLimitMinutes: z.number().min(1).optional(),
  maxAttempts: z.number().min(1).optional(),
  randomizeOptions: z.boolean().optional(),
});

router.post(
  "/",
  requireRole(...MANAGE_ROLES),
  asyncHandler(async (req, res) => {
    const body = quizSchema.parse(req.body);
    const quiz = await Quiz.findOneAndUpdate({ lessonId: body.lessonId }, body, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    res.status(201).json({ quiz });
  })
);

/** Builds a fresh, graded-server-side-only question snapshot for a new attempt. */
async function buildSnapshot(quiz: InstanceType<typeof Quiz>): Promise<ISnapshotQuestion[]> {
  if (quiz.questionBankIds.length > 0) {
    const pool = await Question.find({ _id: { $in: quiz.questionBankIds }, type: { $ne: "short_answer" }, status: "approved" });
    const sampled = shuffle(pool).slice(0, quiz.questionCount ?? pool.length);
    return sampled.map((q) => ({
      questionId: q._id,
      text: q.text,
      type: q.type as "mcq" | "multi_select" | "true_false",
      options: quiz.randomizeOptions ? shuffle(q.options) : q.options,
      correctOptionIds: q.correctOptionIds,
    }));
  }
  // Legacy inline authoring — same snapshot shape, options keyed by their original index as a stable id.
  const legacy = quiz.questions.map((q) => ({
    text: q.text,
    type: "mcq" as const,
    options: q.options.map((text, idx) => ({ id: String(idx), text })),
    correctOptionIds: [String(q.correctIndex)],
  }));
  return quiz.randomizeOptions ? legacy.map((q) => ({ ...q, options: shuffle(q.options) })) : legacy;
}

router.post(
  "/:id/start",
  requireRole("trainee"),
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) throw new ApiError(404, "Quiz not found");

    const existing = await QuizAttempt.findOne({ userId: actor.id, quizId: quiz.id, status: "in_progress" });
    if (existing) {
      const elapsedMs = Date.now() - existing.startedAt.getTime();
      const stillValid = !quiz.timeLimitMinutes || elapsedMs <= quiz.timeLimitMinutes * 60_000 + TIME_GRACE_MS;
      if (stillValid) {
        return res.json({
          attemptId: existing.id,
          startedAt: existing.startedAt,
          timeLimitMinutes: quiz.timeLimitMinutes,
          passScore: quiz.passScore,
          questions: existing.snapshot.map((q) => ({ text: q.text, type: q.type, options: q.options })),
        });
      }
      existing.status = "expired";
      await existing.save();
    }

    if (quiz.maxAttempts) {
      const used = await QuizAttempt.countDocuments({ userId: actor.id, quizId: quiz.id, status: { $in: ["submitted", "expired"] } });
      if (used >= quiz.maxAttempts) throw new ApiError(403, `You've used all ${quiz.maxAttempts} attempts for this quiz`);
    }

    const snapshot = await buildSnapshot(quiz);
    if (snapshot.length === 0) throw new ApiError(400, "This quiz has no questions configured yet");

    const attempt = await QuizAttempt.create({ userId: actor.id, quizId: quiz.id, status: "in_progress", snapshot, startedAt: new Date() });

    res.status(201).json({
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      timeLimitMinutes: quiz.timeLimitMinutes,
      passScore: quiz.passScore,
      questions: snapshot.map((q) => ({ text: q.text, type: q.type, options: q.options })),
    });
  })
);

const submitSchema = z.object({
  answers: z.array(z.object({ questionIndex: z.number().min(0), selectedOptionIds: z.array(z.string()) })),
});

router.post(
  "/attempts/:attemptId/submit",
  requireRole("trainee"),
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const attempt = await QuizAttempt.findById(req.params.attemptId);
    if (!attempt) throw new ApiError(404, "Attempt not found");
    if (String(attempt.userId) !== actor.id) throw new ApiError(403, "Not your attempt");
    if (attempt.status !== "in_progress") throw new ApiError(400, "This attempt was already submitted");

    const quiz = await Quiz.findById(attempt.quizId);
    if (quiz?.timeLimitMinutes) {
      const elapsedMs = Date.now() - attempt.startedAt.getTime();
      if (elapsedMs > quiz.timeLimitMinutes * 60_000 + TIME_GRACE_MS) {
        attempt.status = "expired";
        await attempt.save();
        throw new ApiError(400, "Time limit exceeded — this attempt has expired");
      }
    }

    const body = submitSchema.parse(req.body);
    const answerByIndex = new Map(body.answers.map((a) => [a.questionIndex, a.selectedOptionIds]));

    let correct = 0;
    attempt.snapshot.forEach((q, idx) => {
      const submitted = new Set(answerByIndex.get(idx) ?? []);
      const expected = new Set(q.correctOptionIds);
      const isCorrect = submitted.size === expected.size && [...submitted].every((id) => expected.has(id));
      if (isCorrect) correct += 1;
    });

    const score = attempt.snapshot.length > 0 ? Math.round((correct / attempt.snapshot.length) * 100) : 0;
    const passed = score >= (quiz?.passScore ?? 60);

    attempt.answers = body.answers;
    attempt.score = score;
    attempt.passed = passed;
    attempt.status = "submitted";
    attempt.submittedAt = new Date();
    await attempt.save();

    res.json({ attempt: { id: attempt.id, score, passed } });
  })
);

export default router;
