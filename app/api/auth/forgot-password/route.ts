import { NextRequest, NextResponse } from "next/server";
import { guarded } from "@/lib/server/http";
import { randomBytes, createHash } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { sendEmail } from "@/lib/server/email";
import { checkRateLimit, clientKey } from "@/lib/server/auth/rateLimit";

const schema = z.object({ email: z.string().email() });

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// IDENTICAL response whether or not the email belongs to an account —
// this is the "do not expose whether an email exists" requirement. The
// only observable difference between the two cases is whether an email
// actually arrives, which a would-be enumerator can't distinguish from
// a slow inbox.
const GENERIC_RESPONSE = {
  message: "If an account exists for that email, a password reset link has been sent.",
};

export const POST = guarded("auth.forgot", async (request: NextRequest) => {
  if (!checkRateLimit(clientKey(request, "forgot-password"), 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(GENERIC_RESPONSE);
  }
  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.isActive) {
    // Invalidate any outstanding unused reset tokens for this user, so
    // only the most recently issued link ever works.
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash, // only the HASH is stored — a database leak alone can't be used to reset anyone's password
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your OMV password",
      text: `Use this link to reset your password (valid for 1 hour, single use):\n\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`,
    });
  }

  return NextResponse.json(GENERIC_RESPONSE);
});
