import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 8000),
  mongoUri: required("MONGO_URI", "mongodb://127.0.0.1:27017/synapse_lms"),
  jwtSecret: required("JWT_SECRET", "dev_secret_change_me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  seedSuperAdminEmail: process.env.SEED_SUPER_ADMIN_EMAIL ?? "admin@synapse.local",
  seedSuperAdminPassword: process.env.SEED_SUPER_ADMIN_PASSWORD ?? "ChangeMe123!",
  // Dev-only fallback so the app boots without extra setup. Production MUST set a real
  // 32-byte key (`openssl rand -hex 32`) — provider API keys are encrypted at rest with it.
  encryptionKey: process.env.ENCRYPTION_KEY ?? "0".repeat(64),
};
