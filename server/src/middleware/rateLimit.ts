import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/** Applied to every /api request — generous, just a backstop against runaway clients/scripts. */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

/** Login and MFA-verification endpoints — narrow window against credential/OTP brute-forcing. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please wait a few minutes and try again." },
});

/** AI endpoints proxy to paid provider APIs — capped harder so a bug or abuse can't run up a bill. */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  // A logged-in user's own id is the real identity; only fall back to the (IPv6-safe) IP
  // for the unauthenticated case, which shouldn't occur here since the route requires auth.
  keyGenerator: (req) => req.user?.id ?? ipKeyGenerator(req.ip ?? "unknown"),
  message: { message: "AI request rate limit reached. Please wait a moment and try again." },
});
