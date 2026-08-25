import { ActivityLog, ActivityScope } from "../models/ActivityLog";
import { getIo } from "../sockets/io";

interface LogActivityInput {
  type: string;
  message: string;
  actorId?: string;
  actorName?: string;
  /** Actor's home region, when known — lets the client-side regional map pulse live. */
  region?: string;
  /** "global" reaches all staff; "partner" additionally reaches that partner org's own staff; "user" additionally reaches one trainee. */
  scope: ActivityScope;
  scopeId?: string;
}

/**
 * Persists an activity entry and pushes it live over the /activity socket namespace.
 * Every event lands in the global staff feed; scope+scopeId additionally targets a
 * narrower audience (a consortium partner's own staff, or a single trainee) so people
 * outside MoITT staff still see the events relevant to them without seeing everyone else's.
 */
export async function logActivity(input: LogActivityInput): Promise<void> {
  const entry = await ActivityLog.create(input);

  const ns = getIo().of("/activity");
  ns.to("activity:global").emit("activity", entry);
  if (input.scope === "partner" && input.scopeId) {
    ns.to(`activity:partner:${input.scopeId}`).emit("activity", entry);
  }
  if (input.scope === "user" && input.scopeId) {
    ns.to(`activity:user:${input.scopeId}`).emit("activity", entry);
  }
}
