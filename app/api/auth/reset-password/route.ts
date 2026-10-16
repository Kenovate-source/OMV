import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { hashPassword } from "@/lib/server/auth/passwords";
import { checkRateLimit, clientKey } from "@/lib/server/auth/rateLimit";

const schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

const INVALID_TOKEN = "This reset link is invalid or has expired.";

export async function POST(request: NextRequest) {
  if (!checkRateLimit(clientKey(request, "reset-password"), 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? INVALID_TOKEN }, { status: 400 });
  }
  const { token, newPassword } = parsed.data;

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  // One generic message for every invalid case (unknown token, already
  // used, expired, belongs to an admin rather than a customer) — same
  // "don't leak which" principle as login.
  if (!record || record.usedAt || record.expiresAt < new Date() || !record.userId) {
    return NextResponse.json({ error: INVALID_TOKEN }, { status: 400 });
  }

  const newHash = await hashPassword(newPassword);

  // All three effects happen atomically or not at all: a half-applied
  // reset (password changed but token still usable, or token consumed
  // but password unchanged) would be a real security bug.
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash: newHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Revoke every active session — if the account was compromised, the
    // whole reason to reset is to evict whoever else is logged in.
    prisma.session.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ message: "Password updated. Please sign in with your new password." });
}
