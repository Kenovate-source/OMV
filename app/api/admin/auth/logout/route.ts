import { NextRequest, NextResponse } from "next/server";
import { guarded } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { hashRefreshToken } from "@/lib/server/auth/tokens";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  clearedCookieOptions,
} from "@/lib/server/auth/cookies";

export const POST = guarded("admin.logout", async (request: NextRequest) => {
  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  if (refreshToken) {
    await prisma.session.updateMany({
      where: { refreshTokenHash: hashRefreshToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_ACCESS_COOKIE, "", clearedCookieOptions);
  res.cookies.set(ADMIN_REFRESH_COOKIE, "", clearedCookieOptions);
  return res;
});
