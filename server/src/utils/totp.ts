import { authenticator } from "@otplib/preset-v11";

// otplib v13's default export chain pulls in @scure (ESM-only), which Jest's CJS runtime
// can't parse without extra transform config. @otplib/preset-v11 exposes the same classic
// authenticator API (generateSecret/keyuri/verify) built on Node's native crypto + a plain
// CJS base32 codec — functionally identical for our purposes, and test-runner-friendly.
authenticator.options = { window: 1 }; // accept the previous/next 30s step, absorbing minor clock drift

export function generateMfaSecret(): string {
  return authenticator.generateSecret();
}

export function mfaKeyUri(email: string, secret: string): string {
  return authenticator.keyuri(email, "Synapse LMS", secret);
}

export async function verifyMfaToken(secret: string, token: string): Promise<boolean> {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}
