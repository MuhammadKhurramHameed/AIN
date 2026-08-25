import http from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";
import { setIo } from "./sockets/io";
import { registerKanbanNamespace } from "./sockets/kanban";
import { registerActivityNamespace } from "./sockets/activity";
import { Track } from "./models/Track";

async function main() {
  await connectDb();
  // Track's unique index moved from name-alone to (programmeId, name) when multi-programme
  // support was added — sync so a stale single-field unique index can't block a second
  // programme from reusing a track name.
  await Track.syncIndexes();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: env.clientUrl, credentials: true },
  });
  setIo(io);
  registerKanbanNamespace(io);
  registerActivityNamespace(io);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[server] fatal startup error", err);
  process.exit(1);
});
