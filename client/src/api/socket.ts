import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getKanbanSocket(): Socket {
  if (!socket) {
    socket = io("/kanban", { withCredentials: true, autoConnect: true });
  }
  return socket;
}
