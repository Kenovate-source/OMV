// lib/server/auth/session.ts
//
// Silent session restoration for the `/me` endpoints.
//
// Access tokens live 15 minutes; the refresh token lives 30 days. When a
// page loads and the access token has expired (or is absent), `/me` calls
// these helpers to mint a fresh access token from a still-valid refresh
// cookie — otherwise every user would look "logged out" after 15 minutes
// even though their session is valid.
//
// DELIBERATE DESIGN CHOICE: this path does NOT rotate the refresh token.
// `/me` is called on every page load and can fire concurrently (two tabs;
// React StrictMode's double effect in development). If each call rotated
// the refresh token, the loser of that race would present an already-
// replaced token, fail, and spuriously sign the user out. Rotation is
// still performed by the explicit POST /api/auth/refresh endpoint. The
// trade-off: a session is a fixed 30 days from login (no sliding expiry)
// and a stolen refresh token stays valid until then or until logout /
// password reset revokes it.
//
// Every check re-reads the database: a revoked session, an expired
// session, or a deactivated account all fail here immediately.

import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { hashRefreshToken, signAccessToken } from "./tokens";
import { CUSTOMER_REFRESH_COOKIE, ADMIN_REFRESH_COOKIE } from "./cookies";

export async function restoreCustomerFromRefresh(request: NextRequest) {
  const refreshToken = request.cookies.get(CUSTOMER_REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  const session = await prisma.session.findUnique({
    where: { refreshTokenHash: hashRefreshToken(refreshToken) },
  });
  if (!session || session.revokedAt || session.expiresAt < new Date() || !session.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.isActive) return null;

  const accessToken = await signAccessToken({ sub: user.id, type: "customer" });
  return { user, accessToken };
}

export async function restoreAdminFromRefresh(request: NextRequest) {
  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  const session = await prisma.session.findUnique({
    where: { refreshTokenHash: hashRefreshToken(refreshToken) },
  });
  if (!session || session.revokedAt || session.expiresAt < new Date() || !session.adminUserId) {
    return null;
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: session.adminUserId } });
  if (!admin || !admin.isActive) return null;

  const accessToken = await signAccessToken({ sub: admin.id, type: "admin", role: admin.role });
  return { admin, accessToken };
}
