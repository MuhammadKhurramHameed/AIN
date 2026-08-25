import path from "path";
import { MongoMemoryServer } from "mongodb-memory-server";

/**
 * Standalone dev-only MongoDB, for environments without Docker/WSL or a native mongod
 * (e.g. this Windows box during initial evaluation). Runs a real mongod binary on a fixed
 * port with a persistent dbPath, so `npm run dev` / `npm run seed` can point MONGO_URI at
 * it exactly like a normal standalone instance — no special-casing in application code.
 * Not used in production; a real MongoDB (local or Atlas) should be used there instead.
 */
async function main() {
  const dbPath = path.join(__dirname, "..", "..", ".data", "mongo");
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27117,
      dbPath,
      storageEngine: "wiredTiger",
    },
  });

  console.log(`[dev-mongo] ready -> ${mongod.getUri("synapse_lms")}`);
  console.log("[dev-mongo] leave this process running; stop with Ctrl+C");

  const shutdown = async () => {
    await mongod.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[dev-mongo] failed to start", err);
  process.exit(1);
});
