import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "../config/roles";

export interface JwtPayload {
  sub: string;
  role: Role;
}

export interface MfaPendingPayload {
  sub: string;
  mfaPending: true;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

/** Short-lived token issued after a correct password but before MFA is completed — never accepted by requireAuth. */
export function signMfaPendingToken(userId: string): string {
  return jwt.sign({ sub: userId, mfaPending: true }, env.jwtSecret, { expiresIn: "5m" });
}

export function verifyMfaPendingToken(token: string): MfaPendingPayload {
  const payload = jwt.verify(token, env.jwtSecret) as MfaPendingPayload;
  if (!payload.mfaPending) throw new Error("Not an MFA-pending token");
  return payload;
}
