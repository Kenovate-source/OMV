import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { verifyPassword } from "@/lib/server/auth/passwords";
import { signAccessToken, generateRefreshToken, REFRESH_TOKEN_TTL_MS } from "@/lib/server/auth/tokens";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/server/auth/cookies";
import { checkRateLimit, clientKey } from "@/lib/server/auth/rateLimit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const INVALID_CREDENTIALS = "Invalid email or password.";

// Same dummy-hash timing-equalization as customer login.
const DUMMY_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRzb21lc2FsdA$RdescudvJCsgt3ub+b+dWRWJTmaaJObG0ttTD0+LgRM";

export async function POST(request: NextRequest) {
  // Stricter than customer login (5/min vs 10/min) — admin accounts are
  // higher-value targets.
  if (!checkRateLimit(clientKey(request, "admin-login"), 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }
  const { email, password } = parsed.data;

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !admin.isActive) {
    await verifyPassword(DUMMY_HASH, password);
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }

  const valid = await verifyPassword(admin.passwordHash, password);
  if (!valid) {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }

  // role is embedded for convenience, but requireAdminRole() always
  // re-reads the CURRENT role from the database — the JWT claim is never
  // the authority (see lib/server/auth/rbac.ts).
  const accessToken = await signAccessToken({ sub: admin.id, type: "admin", role: admin.role });
  const { token: refreshToken, hash: refreshTokenHash } = generateRefreshToken();
  await prisma.session.create({
    data: {
      adminUserId: admin.id,
      refreshTokenHash,
      deviceInfo: request.headers.get("user-agent") ?? undefined,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  const res = NextResponse.json({
    admin: { id: admin.id, email: admin.email, fullName: admin.fullName, role: admin.role },
  });
  res.cookies.set(ADMIN_ACCESS_COOKIE, accessToken, accessCookieOptions);
  res.cookies.set(ADMIN_REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  return res;
}
