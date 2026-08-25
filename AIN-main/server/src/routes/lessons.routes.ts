import { Router } from "express";
import { z } from "zod";
import { Lesson } from "../models/Lesson";
import { Course } from "../models/Course";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { aiLimiter } from "../middleware/rateLimit";
import { generateText } from "../services/ai/gateway";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const courseId = z.string().parse(req.query.courseId);
    const lessons = await Lesson.find({ courseId }).sort({ order: 1 });
    res.json({ lessons });
  })
);

const lessonSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1),
  type: z.enum(["video", "document", "quiz"]).optional(),
  content: z.string().optional(),
  url: z.string().optional(),
  order: z.number().optional(),
});

router.post(
  "/",
  requireRole("super_admin", "moitt_staff", "content_admin"),
  asyncHandler(async (req, res) => {
    const body = lessonSchema.parse(req.body);
    const lesson = await Lesson.create(body);
    res.status(201).json({ lesson });
  })
);

router.patch(
  "/:id",
  requireRole("super_admin", "moitt_staff", "content_admin"),
  asyncHandler(async (req, res) => {
    const body = lessonSchema.partial().parse(req.body);
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!lesson) throw new ApiError(404, "Lesson not found");
    res.json({ lesson });
  })
);

router.delete(
  "/:id",
  requireRole("super_admin", "moitt_staff", "content_admin"),
  asyncHandler(async (req, res) => {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  })
);

// Learner-facing AI helper, scoped strictly to this lesson's own stored content — no
// open-ended chat, no retrieval outside what's actually in the database for this lesson.
router.post(
  "/:id/ask-ai",
  aiLimiter,
  asyncHandler(async (req, res) => {
    const question = z.string().min(1).max(500).parse(req.body.question);
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) throw new ApiError(404, "Lesson not found");
    const course = await Course.findById(lesson.courseId).select("title description");

    const context = [
      `Course: ${course?.title ?? "Unknown course"}`,
      course?.description ? `Course description: ${course.description}` : "",
      `Lesson: ${lesson.title}`,
      lesson.content ? `Lesson content:\n${lesson.content}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const { text } = await generateText({
      capability: "lesson_assistant",
      systemPrompt:
        "You are a helpful AI tutor for a national AI-literacy training programme. Answer only using the lesson context provided. If the answer isn't in the context, say so honestly rather than guessing. Keep answers concise and encouraging.",
      prompt: `${context}\n\nLearner question: ${question}`,
      actorId: req.user!.id,
      feature: "lesson_assistant",
    });

    res.json({ answer: text });
  })
);

export default router;
