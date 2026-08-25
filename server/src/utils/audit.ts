import { Request } from "express";
import { AuditLog } from "../models/AuditLog";
import { IUser } from "../models/User";

interface LogAuditInput {
  action: string;
  actor?: IUser | { id?: string; email?: string; role?: string };
  actorEmail?: string;
  req?: Request;
  targetType?: string;
  targetId?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}

/** Records a security-relevant event (auth, MFA, secret access, privilege changes). Never throws — a logging failure must not break the request it's observing. */
export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    await AuditLog.create({
      actorId: input.actor && "id" in input.actor ? input.actor.id : undefined,
      actorEmail: input.actor?.email ?? input.actorEmail,
      actorRole: input.actor?.role,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      ip: input.req?.ip,
      success: input.success,
      metadata: input.metadata,
    });
  } catch (err) {
    console.error("[audit] failed to record entry", err);
  }
}
