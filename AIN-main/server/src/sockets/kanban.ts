import { Server, Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";

/**
 * A lightweight /kanban namespace, kept separate from the rest of the app so the
 * websocket layer doesn't add overhead to routes that don't need it. Auth is a cookie
 * check at handshake time; rooms are one per board so only viewers of that board
 * receive its card events.
 */
export function registerKanbanNamespace(io: Server): void {
  const kanban = io.of("/kanban");

  kanban.use((socket: Socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie ?? "";
      const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
      if (!match) return next(new Error("unauthenticated"));
      verifyToken(decodeURIComponent(match[1]));
      next();
    } catch {
      next(new Error("unauthenticated"));
    }
  });

  kanban.on("connection", (socket: Socket) => {
    socket.on("board:join", (boardId: string) => {
      socket.join(`board:${boardId}`);
    });
    socket.on("board:leave", (boardId: string) => {
      socket.leave(`board:${boardId}`);
    });
  });
}
