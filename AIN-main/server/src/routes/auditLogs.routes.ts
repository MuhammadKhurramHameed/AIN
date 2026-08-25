import { Router, Request } from "express";
import { AuditLog } from "../models/AuditLog";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { parsePagination, paginationMeta } from "../utils/pagination";
import { toCsv, sendCsv } from "../utils/csv";
import { logAudit } from "../utils/audit";

const router = Router();
router.use(requireAuth, requireRole("super_admin"));

function buildAuditFilter(query: Request["query"]): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (query.action) filter.action = query.action;
  if (query.actorEmail) filter.actorEmail = new RegExp(String(query.actorEmail).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (query.success === "true") filter.success = true;
  if (query.success === "false") filter.success = false;
  return filter;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = buildAuditFilter(req.query);
    const pagination = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ logs, ...paginationMeta(total, pagination) });
  })
);

const EXPORT_ROW_CAP = 20_000;

router.get(
  "/export",
  asyncHandler(async (req, res) => {
    const filter = buildAuditFilter(req.query);
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(EXPORT_ROW_CAP).lean();

    const csv = toCsv(logs, [
      { header: "Timestamp", value: (l) => l.createdAt?.toISOString() ?? "" },
      { header: "Action", value: (l) => l.action },
      { header: "Actor email", value: (l) => l.actorEmail ?? "" },
      { header: "Actor role", value: (l) => l.actorRole ?? "" },
      { header: "IP", value: (l) => l.ip ?? "" },
      { header: "Success", value: (l) => (l.success ? "true" : "false") },
      { header: "Target type", value: (l) => l.targetType ?? "" },
      { header: "Target id", value: (l) => l.targetId ?? "" },
      { header: "Metadata", value: (l) => (l.metadata ? JSON.stringify(l.metadata) : "") },
    ]);

    await logAudit({ action: "audit_log_exported", actor: req.user!, req, success: true, metadata: { count: logs.length, filter: req.query } });
    sendCsv(res, `audit-log-export-${Date.now()}.csv`, csv);
  })
);

export default router;
