// lib/server/auth/cookies.ts
//
// Customer and admin sessions use entirely separate cookie names so the
// two auth systems can never be confused with each other at the
// transport level, not just at the JWT-payload level (defense in depth
// — matches the locked decision to keep AdminUser fully separate from
// User, mirroring Phase 4.2's separate AdminAuthProvider/AuthProvider).

import { REFRESH_TOKEN_TTL_MS } from "./tokens";

export const CUSTOMER_ACCESS_COOKIE = "omv_access_token";
export const CUSTOMER_REFRESH_COOKIE = "omv_refresh_token";
export const ADMIN_ACCESS_COOKIE = "omv_admin_access_token";
export const ADMIN_REFRESH_COOKIE = "omv_admin_refresh_token";

const isProd = process.env.NODE_ENV === "production";

export const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 15 * 60, // seconds — mirrors ACCESS_TOKEN_TTL_SECONDS
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(REFRESH_TOKEN_TTL_MS / 1000),
};

export const clearedCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
};
