import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getActivitySocket(): Socket {
  if (!socket) {
    socket = io("/activity", { withCredentials: true, autoConnect: true });
  }
  return socket;
}
