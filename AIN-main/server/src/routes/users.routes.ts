import { Router, Request } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { User, IUser } from "../models/User";
import { Track } from "../models/Track";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { DELEGATION_RULES, ROLES } from "../config/roles";
import { logActivity } from "../utils/activity";
import { logAudit } from "../utils/audit";
import { parsePagination, paginationMeta } from "../utils/pagination";
import { toCsv, sendCsv } from "../utils/csv";

const router = Router();
router.use(requireAuth);

/** Same visibility rules GET / enforces, shared with the CSV export so a user can never
 * export more than they could already see one page at a time. */
function buildUserListFilter(actor: IUser, query: Request["query"]): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (actor.role === "super_admin" || actor.role === "moitt_staff") {
    if (query.role) filter.role = query.role;
    if (query.organizationId) filter.organizationId = query.organizationId;
  } else if (actor.role === "consortium_partner_admin") {
    filter.organizationId = actor.organizationId;
    filter.role = { $in: ["consortium_partner_admin", "consortium_partner_staff"] };
  } else if (actor.role === "content_admin" && query.role === "tutor") {
    filter.role = "tutor";
  } else {
    throw new ApiError(403, "Not authorized to list users");
  }

  if (typeof query.q === "string" && query.q.trim().length > 0) {
    const q = query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }];
  }
  return filter;
}

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(ROLES),
  organizationId: z.string().optional(),
  trackId: z.string().optional(),
  gender: z.enum(["female", "male", "other", "prefer_not_to_say"]).optional(),
  category: z.string().optional(),
  phone: z.string().optional(),
  educationYears: z.number().min(0).optional(),
  experienceYears: z.number().min(0).optional(),
  specialization: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
});

// List users, scoped to what the caller is allowed to see.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const filter = buildUserListFilter(actor, req.query);

    const pagination = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
    const [users, total] = await Promise.all([
      User.find(filter).select("-passwordHash").sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
      User.countDocuments(filter),
    ]);
    res.json({ users, ...paginationMeta(total, pagination) });
  })
);

const EXPORT_ROW_CAP = 25_000;

router.get(
  "/export",
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const filter = buildUserListFilter(actor, req.query);
    const users = await User.find(filter).select("-passwordHash").sort({ createdAt: -1 }).limit(EXPORT_ROW_CAP).lean();

    const csv = toCsv(users, [
      { header: "Name", value: (u) => u.name },
      { header: "Email", value: (u) => u.email },
      { header: "Role", value: (u) => u.role },
      { header: "Status", value: (u) => u.status },
      { header: "Gender", value: (u) => u.gender ?? "" },
      { header: "Region", value: (u) => u.region ?? "" },
      { header: "Phone", value: (u) => u.phone ?? "" },
      { header: "Education years", value: (u) => u.educationYears ?? "" },
      { header: "Experience years", value: (u) => u.experienceYears ?? "" },
      { header: "Created at", value: (u) => u.createdAt?.toISOString() ?? "" },
    ]);

    await logAudit({ action: "users_exported", actor, req, success: true, metadata: { count: users.length, filter: req.query } });
    sendCsv(res, `users-export-${Date.now()}.csv`, csv);
  })
);

const bulkRowSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  role: z.enum(ROLES),
  organizationId: z.string().optional(),
  track: z.string().optional(), // track _id, or its exact name
  gender: z.enum(["female", "male", "other", "prefer_not_to_say"]).optional(),
  phone: z.string().optional(),
  educationYears: z.coerce.number().min(0).optional(),
  experienceYears: z.coerce.number().min(0).optional(),
});

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

const bulkSchema = z.object({ users: z.array(z.record(z.unknown())).min(1).max(2000) });

function generateTempPassword(): string {
  return crypto.randomBytes(9).toString("base64url"); // 12 chars, URL-safe, no ambiguous punctuation
}

// Bulk create (CSV import). Never fails the whole batch on one bad row — each row is
// validated and delegation-checked independently, so a partial CSV still makes progress
// and the caller gets back exactly which rows to fix and re-submit.
router.post(
  "/bulk",
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const { users: rows } = bulkSchema.parse(req.body);
    const allowed = DELEGATION_RULES[actor.role] ?? [];

    const allTracks = await Track.find().select("name").lean();
    const trackById = new Map(allTracks.map((t) => [String(t._id), t]));
    const trackByName = new Map(allTracks.map((t) => [t.name.trim().toLowerCase(), t]));

    const results: { row: number; status: "created" | "skipped"; email?: string; reason?: string; tempPassword?: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 1;
      const parsed = bulkRowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        results.push({ row: rowNum, status: "skipped", reason: parsed.error.issues.map((iss) => iss.message).join("; ") });
        continue;
      }
      const body = parsed.data;

      if (!allowed.includes(body.role)) {
        results.push({ row: rowNum, status: "skipped", email: body.email, reason: `${actor.role} may not create ${body.role} accounts` });
        continue;
      }

      const email = body.email.toLowerCase();
      const existing = await User.findOne({ email });
      if (existing) {
        results.push({ row: rowNum, status: "skipped", email, reason: "A user with this email already exists" });
        continue;
      }

      let organizationId = body.organizationId;
      if (actor.role === "consortium_partner_admin") organizationId = String(actor.organizationId);
      if (["consortium_partner_admin", "consortium_partner_staff"].includes(body.role) && !organizationId) {
        results.push({ row: rowNum, status: "skipped", email, reason: "organizationId is required for consortium partner roles" });
        continue;
      }

      let trackId: string | undefined;
      if (body.track) {
        const track = OBJECT_ID_RE.test(body.track) ? trackById.get(body.track) : trackByName.get(body.track.trim().toLowerCase());
        if (!track) {
          results.push({ row: rowNum, status: "skipped", email, reason: `Track "${body.track}" not found (checked by id and by exact name)` });
          continue;
        }
        trackId = String(track._id);
      }

      const tempPassword = body.password ?? generateTempPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      const user = await User.create({
        name: body.name,
        email,
        passwordHash,
        role: body.role,
        organizationId,
        trackId,
        gender: body.gender,
        phone: body.phone,
        educationYears: body.educationYears,
        experienceYears: body.experienceYears,
        createdBy: actor.id,
      });

      results.push({ row: rowNum, status: "created", email: user.email, tempPassword: body.password ? undefined : tempPassword });
    }

    const createdCount = results.filter((r) => r.status === "created").length;
    await logActivity({
      type: "users_bulk_imported",
      message: `${actor.name} bulk-imported ${createdCount} account(s)`,
      actorId: actor.id,
      actorName: actor.name,
      scope: "global",
    });
    await logAudit({
      action: "users_bulk_imported",
      actor,
      req,
      success: true,
      metadata: { attempted: rows.length, created: createdCount, skipped: rows.length - createdCount },
    });

    res.status(201).json({ results, created: createdCount, skipped: rows.length - createdCount });
  })
);

// Create a staff/trainee account (delegation).
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const body = createSchema.parse(req.body);

    const allowed = DELEGATION_RULES[actor.role] ?? [];
    if (!allowed.includes(body.role)) {
      throw new ApiError(403, `${actor.role} may not create ${body.role} accounts`);
    }

    const existing = await User.findOne({ email: body.email.toLowerCase() });
    if (existing) throw new ApiError(409, "A user with this email already exists");

    let organizationId = body.organizationId;
    if (actor.role === "consortium_partner_admin") {
      organizationId = String(actor.organizationId);
    }
    if (["consortium_partner_admin", "consortium_partner_staff"].includes(body.role) && !organizationId) {
      throw new ApiError(400, "organizationId is required for consortium partner roles");
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await User.create({
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash,
      role: body.role,
      organizationId,
      trackId: body.trackId,
      gender: body.gender,
      category: body.category,
      phone: body.phone,
      educationYears: body.educationYears,
      experienceYears: body.experienceYears,
      specialization: body.specialization,
      permissions: actor.role === "super_admin" ? body.permissions ?? [] : [],
      createdBy: actor.id,
    });

    await logActivity({
      type: "user_created",
      message: `${actor.name} created a ${body.role.replace(/_/g, " ")} account for ${user.name}`,
      actorId: actor.id,
      actorName: actor.name,
      scope: organizationId ? "partner" : "global",
      scopeId: organizationId ? String(organizationId) : undefined,
    });
    await logAudit({
      action: "user_created",
      actor,
      req,
      success: true,
      targetType: "User",
      targetId: user.id,
      metadata: { createdRole: body.role, createdEmail: user.email },
    });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        trackId: user.trackId,
        status: user.status,
      },
    });
  })
);

router.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const status = z.enum(["active", "disabled"]).parse(req.body.status);
    const target = await User.findById(req.params.id);
    if (!target) throw new ApiError(404, "User not found");

    const isSuperOrMoitt = actor.role === "super_admin" || actor.role === "moitt_staff";
    const isOwnOrgAdmin =
      actor.role === "consortium_partner_admin" &&
      String(target.organizationId) === String(actor.organizationId) &&
      target.role === "consortium_partner_staff";

    if (!isSuperOrMoitt && !isOwnOrgAdmin) throw new ApiError(403, "Not authorized");

    target.status = status;
    await target.save();
    await logAudit({
      action: "user_status_changed",
      actor,
      req,
      success: true,
      targetType: "User",
      targetId: target.id,
      metadata: { newStatus: status, targetEmail: target.email },
    });
    res.json({ ok: true });
  })
);

const profileSchema = z.object({
  phone: z.string().optional(),
  educationYears: z.number().min(0).optional(),
  experienceYears: z.number().min(0).optional(),
  specialization: z.array(z.string()).optional(),
});

router.patch(
  "/:id/profile",
  asyncHandler(async (req, res) => {
    const actor = req.user!;
    const isSelf = actor.id === req.params.id;
    const isSuperOrMoitt = actor.role === "super_admin" || actor.role === "moitt_staff";
    if (!isSelf && !isSuperOrMoitt) throw new ApiError(403, "Not authorized");

    const body = profileSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, body, { new: true }).select("-passwordHash");
    if (!user) throw new ApiError(404, "User not found");
    res.json({ user });
  })
);

export default router;
