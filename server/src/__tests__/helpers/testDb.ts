import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Server } from "socket.io";
import { setIo } from "../../sockets/io";

let mongod: MongoMemoryServer | null = null;

/** Boots an isolated in-memory MongoDB + a standalone (unattached) Socket.io server so
 * routes that call logActivity()/getIo() don't throw in tests that never start server.ts. */
export async function startTestDb(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  setIo(new Server());
}

export async function stopTestDb(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
  mongod = null;
}
