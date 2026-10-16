import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_TTL_MS,
} from "@/lib/server/auth/tokens";
import {
  CUSTOMER_ACCESS_COOKIE,
  CUSTOMER_REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
  clearedCookieOptions,
} from "@/lib/server/auth/cookies";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(CUSTOMER_REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const session = await prisma.session.findUnique({
    where: { refreshTokenHash: hashRefreshToken(refreshToken) },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date() || !session.userId) {
    const res = NextResponse.json({ error: "Session expired." }, { status: 401 });
    res.cookies.set(CUSTOMER_ACCESS_COOKIE, "", clearedCookieOptions);
    res.cookies.set(CUSTOMER_REFRESH_COOKIE, "", clearedCookieOptions);
    return res;
  }

  // Rotate: issue a new refresh token and invalidate this one, so a
  // leaked-but-not-yet-used refresh token has a shrinking window of
  // validity rather than staying usable for its full 30-day life.
  const { token: newRefreshToken, hash: newHash } = generateRefreshToken();
  await prisma.session.update({
    where: { id: session.id },
    data: { refreshTokenHash: newHash, expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS) },
  });

  const accessToken = await signAccessToken({ sub: session.userId, type: "customer" });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_ACCESS_COOKIE, accessToken, accessCookieOptions);
  res.cookies.set(CUSTOMER_REFRESH_COOKIE, newRefreshToken, refreshCookieOptions);
  return res;
}
