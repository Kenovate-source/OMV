// lib/server/auth/tokens.ts
//
// Access tokens: short-lived JWTs (jose — edge/node-compatible, unlike
// jsonwebtoken), carrying a `type` claim ("customer" | "admin") so a
// customer token can never be misread as an admin token even if the
// secret were somehow shared (it isn't — see below).
//
// Refresh tokens: NOT JWTs. A high-entropy random value, stored only as
// a SHA-256 hash in Session.refreshTokenHash (never argon2 — argon2 is
// for low-entropy user-chosen secrets like passwords; a 256-bit random
// token doesn't need a slow KDF, and a fast hash keeps the DB lookup
// cheap). Rotated on every /api/auth/refresh call.

import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "crypto";
import { ConfigError } from "@/lib/server/errors";

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function accessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new ConfigError("JWT_ACCESS_SECRET");
  return new TextEncoder().encode(secret);
}

export interface AccessTokenPayload {
  sub: string; // userId or adminId
  type: "customer" | "admin";
  role?: "SUPER" | "BUSINESS" | "STAFF"; // present only for type: "admin"
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(accessSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret());
    if (payload.type !== "customer" && payload.type !== "admin") return null;
    if (typeof payload.sub !== "string") return null;
    return payload as unknown as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function generateRefreshToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("hex");
  return { token, hash: hashRefreshToken(token) };
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
