import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { hashRefreshToken } from "@/lib/server/auth/tokens";
import {
  CUSTOMER_ACCESS_COOKIE,
  CUSTOMER_REFRESH_COOKIE,
  clearedCookieOptions,
} from "@/lib/server/auth/cookies";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(CUSTOMER_REFRESH_COOKIE)?.value;
  if (refreshToken) {
    // Revoke the session server-side, not just clear the cookie — a
    // stolen refresh token must stop working the moment the real user
    // logs out, not remain valid until its 30-day expiry.
    await prisma.session.updateMany({
      where: { refreshTokenHash: hashRefreshToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_ACCESS_COOKIE, "", clearedCookieOptions);
  res.cookies.set(CUSTOMER_REFRESH_COOKIE, "", clearedCookieOptions);
  return res;
}
