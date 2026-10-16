// lib/server/auth/passwords.ts
//
// Argon2id password hashing — the locked choice over bcrypt. Tuned
// parameters are argon2's own sane defaults; revisit only if a real
// load/latency measurement on actual Vercel infrastructure shows a need,
// not speculatively.

import argon2 from "argon2";

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    // argon2.verify throws on a malformed hash rather than returning
    // false — normalize to false so callers never need a try/catch.
    return false;
  }
}
