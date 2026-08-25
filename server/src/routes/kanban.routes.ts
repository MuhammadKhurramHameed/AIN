import { Router } from "express";
import { z } from "zod";
import { KanbanBoard } from "../models/KanbanBoard";
import { KanbanCard } from "../models/KanbanCard";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { getIo } from "../sockets/io";
import { logActivity } from "../utils/activity";

const router = Router();
router.use(requireAuth);

router.get(
  "/boards",
  asyncHandler(async (_req, res) => {
    const boards = await KanbanBoard.find().sort({ createdAt: -1 });
    res.json({ boards });
  })
);

const boardSchema = z.object({
  name: z.string().min(1),
  scope: z.enum(["content", "consortium", "track_rollout", "general"]).optional(),
});

router.post(
  "/boards",
  asyncHandler(async (req, res) => {
    const body = boardSchema.parse(req.body);
    const board = await KanbanBoard.create({ ...body, ownerId: req.user!.id });
    res.status(201).json({ board });
  })
);

router.get(
  "/boards/:boardId/cards",
  asyncHandler(async (req, res) => {
    const cards = await KanbanCard.find({ boardId: req.params.boardId })
      .populate("assigneeId", "name email")
      .sort({ order: 1 });
    res.json({ cards });
  })
);

const cardSchema = z.object({
  boardId: z.string(),
  columnId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().optional(),
  order: z.number().optional(),
});

router.post(
  "/cards",
  asyncHandler(async (req, res) => {
    const body = cardSchema.parse(req.body);
    const actor = req.user!;
    const card = await KanbanCard.create({ ...body, createdBy: actor.id });
    getIo().of("/kanban").to(`board:${body.boardId}`).emit("card:created", card);

    await logActivity({
      type: "kanban_card_created",
      message: `${actor.name} added a task: ${card.title}`,
      actorId: actor.id,
      actorName: actor.name,
      scope: "global",
    });

    res.status(201).json({ card });
  })
);

const updateSchema = z.object({
  columnId: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().optional(),
  order: z.number().optional(),
});

// Handles both edits and column/order moves (drag-drop) — one event keeps the client simple.
router.patch(
  "/cards/:id",
  asyncHandler(async (req, res) => {
    const body = updateSchema.parse(req.body);
    const actor = req.user!;
    const before = await KanbanCard.findById(req.params.id);
    const card = await KanbanCard.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!card) throw new ApiError(404, "Card not found");
    getIo().of("/kanban").to(`board:${card.boardId}`).emit("card:updated", card);

    if (body.columnId && before && before.columnId !== "done" && body.columnId === "done") {
      await logActivity({
        type: "kanban_card_done",
        message: `${actor.name} marked "${card.title}" as done`,
        actorId: actor.id,
        actorName: actor.name,
        scope: "global",
      });
    }

    res.json({ card });
  })
);

router.delete(
  "/cards/:id",
  asyncHandler(async (req, res) => {
    const card = await KanbanCard.findByIdAndDelete(req.params.id);
    if (!card) throw new ApiError(404, "Card not found");
    getIo().of("/kanban").to(`board:${card.boardId}`).emit("card:deleted", { id: card.id, boardId: card.boardId });
    res.json({ ok: true });
  })
);

export default router;
