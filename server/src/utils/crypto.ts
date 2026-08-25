import crypto from "crypto";
import { env } from "../config/env";

const ALGO = "aes-256-gcm";

function key(): Buffer {
  return Buffer.from(env.encryptionKey, "hex");
}

/** Encrypts a secret (API key, SMTP password, ...) for storage. Format: iv:authTag:ciphertext, all hex. */
export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext.toString("hex")}`;
}

export function decryptSecret(stored: string): string {
  const [ivHex, tagHex, dataHex] = stored.split(":");
  const decipher = crypto.createDecipheriv(ALGO, key(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return plaintext.toString("utf8");
}

/** Never send a raw secret to the client — show a masked tail like sk-••••••••1234. */
export function maskSecret(plaintext: string): string {
  if (plaintext.length <= 4) return "••••";
  return `${"•".repeat(Math.min(8, plaintext.length - 4))}${plaintext.slice(-4)}`;
}
