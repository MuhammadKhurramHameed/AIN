import { Router } from "express";
import { Certificate } from "../models/Certificate";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const certificates = await Certificate.find({ userId: req.user!.id }).populate("courseId", "title");
    res.json({ certificates });
  })
);

// Public verification endpoint — no auth required.
router.get(
  "/verify/:code",
  asyncHandler(async (req, res) => {
    const certificate = await Certificate.findOne({ verificationCode: req.params.code })
      .populate("userId", "name")
      .populate("courseId", "title");
    if (!certificate) throw new ApiError(404, "Certificate not found");
    res.json({ certificate });
  })
);

export default router;
