import { Server, Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";
import { STAFF_ACTIVITY_ROLES } from "../config/roles";

/**
 * Live feed of activity across the platform, scoped by role: staff get the global
 * room, consortium partner accounts get their own org's room, everyone gets a personal
 * room for events about just them (e.g. a trainee's own certificate). Kept as its own
 * namespace (separate from /kanban) so a client only subscribes to the streams it needs.
 */
export function registerActivityNamespace(io: Server): void {
  const activity = io.of("/activity");

  activity.use((socket: Socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie ?? "";
      const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
      if (!match) return next(new Error("unauthenticated"));
      const payload = verifyToken(decodeURIComponent(match[1]));
      (socket.data as { userId: string }).userId = payload.sub;
      next();
    } catch {
      next(new Error("unauthenticated"));
    }
  });

  activity.on("connection", async (socket: Socket) => {
    const userId = (socket.data as { userId: string }).userId;
    const user = await User.findById(userId);
    if (!user) return;

    socket.join(`activity:user:${user.id}`);
    if (STAFF_ACTIVITY_ROLES.includes(user.role)) {
      socket.join("activity:global");
    }
    if (
      (user.role === "consortium_partner_admin" || user.role === "consortium_partner_staff") &&
      user.organizationId
    ) {
      socket.join(`activity:partner:${user.organizationId}`);
    }
  });
}
