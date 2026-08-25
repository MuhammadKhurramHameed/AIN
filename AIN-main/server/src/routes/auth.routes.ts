import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User";
import { signToken, signMfaPendingToken, verifyMfaPendingToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { authLimiter } from "../middleware/rateLimit";
import { encryptSecret, decryptSecret } from "../utils/crypto";
import { generateMfaSecret, mfaKeyUri, verifyMfaToken } from "../utils/totp";
import { logAudit } from "../utils/audit";
import QRCode from "qrcode";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function publicUser(user: InstanceType<typeof User>) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    trackId: user.trackId,
    region: user.region,
    mfaEnabled: user.mfaEnabled,
  };
}

router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.status === "disabled") {
      await logAudit({ action: "login", actorEmail: email, success: false, req, metadata: { reason: "not_found_or_disabled" } });
      throw new ApiError(401, "Invalid email or password");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      await logAudit({ action: "login", actor: user, success: false, req, metadata: { reason: "bad_password" } });
      throw new ApiError(401, "Invalid email or password");
    }

    if (user.mfaEnabled) {
      await logAudit({ action: "login_password_ok_mfa_pending", actor: user, success: true, req });
      return res.json({ mfaRequired: true, mfaToken: signMfaPendingToken(user.id) });
    }

    const token = signToken({ sub: user.id, role: user.role });
    res.cookie("token", token, cookieOpts);
    await logAudit({ action: "login", actor: user, success: true, req });
    res.json({ user: publicUser(user) });
  })
);

const mfaLoginSchema = z.object({ mfaToken: z.string(), code: z.string().min(6).max(10) });

router.post(
  "/mfa/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { mfaToken, code } = mfaLoginSchema.parse(req.body);
    let payload;
    try {
      payload = verifyMfaPendingToken(mfaToken);
    } catch {
      throw new ApiError(401, "MFA session expired — please log in again");
    }

    const user = await User.findById(payload.sub).select("+mfaSecret");
    if (!user || user.status === "disabled" || !user.mfaEnabled || !user.mfaSecret) {
      throw new ApiError(401, "MFA session invalid");
    }

    const valid = await verifyMfaToken(decryptSecret(user.mfaSecret), code);
    if (!valid) {
      await logAudit({ action: "mfa_login", actor: user, success: false, req });
      throw new ApiError(401, "Incorrect authentication code");
    }

    const token = signToken({ sub: user.id, role: user.role });
    res.cookie("token", token, cookieOpts);
    await logAudit({ action: "mfa_login", actor: user, success: true, req });
    res.json({ user: publicUser(user) });
  })
);

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        trackId: user.trackId,
        region: user.region,
        permissions: user.permissions,
        mfaEnabled: user.mfaEnabled,
      },
    });
  })
);

// MFA is offered to staff/admin roles who can reach sensitive control planes — not trainees.
const MFA_ELIGIBLE_ROLES = ["super_admin", "moitt_staff", "content_admin", "content_reviewer"] as const;

function assertMfaEligible(role: string) {
  if (!MFA_ELIGIBLE_ROLES.includes(role as (typeof MFA_ELIGIBLE_ROLES)[number])) {
    throw new ApiError(403, "MFA is available for staff and admin accounts");
  }
}

router.post(
  "/mfa/setup",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    assertMfaEligible(user.role);
    if (user.mfaEnabled) throw new ApiError(400, "MFA is already enabled — disable it first to re-enroll");

    const secret = generateMfaSecret();
    user.mfaSecret = encryptSecret(secret);
    await user.save();

    const uri = mfaKeyUri(user.email, secret);
    const qrDataUrl = await QRCode.toDataURL(uri);
    await logAudit({ action: "mfa_setup_started", actor: user, success: true, req });
    res.json({ secret, otpauthUrl: uri, qrDataUrl });
  })
);

const verifySetupSchema = z.object({ code: z.string().min(6).max(10) });

router.post(
  "/mfa/verify-setup",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id).select("+mfaSecret");
    if (!user) throw new ApiError(404, "User not found");
    assertMfaEligible(user.role);
    if (!user.mfaSecret) throw new ApiError(400, "Call /mfa/setup first");

    const { code } = verifySetupSchema.parse(req.body);
    const valid = await verifyMfaToken(decryptSecret(user.mfaSecret), code);
    if (!valid) {
      await logAudit({ action: "mfa_enable", actor: user, success: false, req });
      throw new ApiError(400, "Incorrect code — check your authenticator app and try again");
    }

    user.mfaEnabled = true;
    await user.save();
    await logAudit({ action: "mfa_enable", actor: user, success: true, req });
    res.json({ ok: true });
  })
);

router.post(
  "/mfa/disable",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id).select("+mfaSecret");
    if (!user) throw new ApiError(404, "User not found");
    if (!user.mfaEnabled) throw new ApiError(400, "MFA is not enabled");

    const { code } = verifySetupSchema.parse(req.body);
    const valid = user.mfaSecret && (await verifyMfaToken(decryptSecret(user.mfaSecret), code));
    if (!valid) {
      await logAudit({ action: "mfa_disable", actor: user, success: false, req });
      throw new ApiError(400, "Incorrect code");
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    await user.save();
    await logAudit({ action: "mfa_disable", actor: user, success: true, req });
    res.json({ ok: true });
  })
);

// Super Admin can see who has MFA enabled, for compliance follow-up — never exposes secrets.
router.get(
  "/mfa/status",
  requireAuth,
  requireRole("super_admin"),
  asyncHandler(async (_req, res) => {
    const users = await User.find({ role: { $in: MFA_ELIGIBLE_ROLES } })
      .select("name email role mfaEnabled")
      .sort({ role: 1, name: 1 });
    res.json({ users });
  })
);

export default router;
