import { NextRequest, NextResponse } from "next/server";
import { guarded } from "@/lib/server/http";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { verifyPassword } from "@/lib/server/auth/passwords";
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
  password: z.string().min(1),
});

// Single generic message for EVERY failure reason (no such email, wrong
// password, deactivated account) — this is what "no user-enumeration
// leaks" actually means in practice: the response must be
// indistinguishable regardless of which of those is true.
const INVALID_CREDENTIALS = "Invalid email or password.";

// A syntactically valid argon2id hash of an arbitrary throwaway value,
// used purely so a "no such user" request spends comparable time to a
// "wrong password" request — otherwise response latency alone would let
// an attacker distinguish the two (a timing-based enumeration leak).
const DUMMY_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRzb21lc2FsdA$RdescudvJCsgt3ub+b+dWRWJTmaaJObG0ttTD0+LgRM";

export const POST = guarded("auth.login", async (request: NextRequest) => {
  if (!checkRateLimit(clientKey(request, "login"), 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    await verifyPassword(DUMMY_HASH, password);
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }

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
});
