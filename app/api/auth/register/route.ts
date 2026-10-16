import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { hashPassword } from "@/lib/server/auth/passwords";
import { signAccessToken, generateRefreshToken, REFRESH_TOKEN_TTL_MS } from "@/lib/server/auth/tokens";
import {
  CUSTOMER_ACCESS_COOKIE,
  CUSTOMER_REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/server/auth/cookies";
import { checkRateLimit, clientKey } from "@/lib/server/auth/rateLimit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  fullName: z.string().min(1),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  if (!checkRateLimit(clientKey(request, "register"), 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { email, password, fullName, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Registration is one of the few auth flows where confirming an
    // email is taken is normal, expected UX (the user needs to know to
    // sign in instead) — unlike login/forgot-password, where this
    // response would be a genuine enumeration leak.
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, fullName, phone: phone || null },
  });
  await prisma.notificationPreference.create({ data: { userId: user.id } });

  const accessToken = await signAccessToken({ sub: user.id, type: "customer" });
  const { token: refreshToken, hash: refreshTokenHash } = generateRefreshToken();
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash,
      deviceInfo: request.headers.get("user-agent") ?? undefined,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, fullName: user.fullName },
  });
  res.cookies.set(CUSTOMER_ACCESS_COOKIE, accessToken, accessCookieOptions);
  res.cookies.set(CUSTOMER_REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  return res;
}
