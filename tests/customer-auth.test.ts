// Customer authentication: registration, login, invalid-login rejection,
// logout/session revocation, refresh rotation, rate limiting,
// no-enumeration behavior, and password-reset token lifecycle.
//
// REAL integration tests: they invoke the actual Route Handlers against a
// REAL Postgres database via Prisma. Status: WRITTEN, NOT YET EXECUTED
// (the authoring sandbox has no network/database access — see
// IMPLEMENTATION_LOG.md). They must be run against a throwaway test DB.

import { describe, it, expect, afterAll } from "vitest";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/server/prisma";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { POST as refresh } from "@/app/api/auth/refresh/route";
import { GET as me } from "@/app/api/auth/me/route";
import { POST as forgotPassword } from "@/app/api/auth/forgot-password/route";
import { POST as resetPassword } from "@/app/api/auth/reset-password/route";
import { jsonRequest, uniqueEmail, freshIp } from "./helpers";

const createdEmails: string[] = [];
const PASSWORD = "CorrectHorse-Battery9";

async function makeUser() {
  const email = uniqueEmail("cust");
  createdEmails.push(email);
  const res = await register(
    jsonRequest("/api/auth/register", { body: { email, password: PASSWORD, fullName: "Test Customer" } })
  );
  return { email, res };
}

afterAll(async () => {
  // Delete ONLY rows this file created. Sessions/tokens/preferences
  // cascade from User (onDelete: Cascade in the schema).
  await prisma.user.deleteMany({ where: { email: { in: createdEmails } } });
  await prisma.$disconnect();
});

describe("registration", () => {
  it("creates an account, hashes the password, and sets httpOnly cookies", async () => {
    const { email, res } = await makeUser();
    expect(res.status).toBe(200);

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).not.toBeNull();
    // Never stored in plaintext; argon2id format.
    expect(user!.passwordHash).not.toContain(PASSWORD);
    expect(user!.passwordHash.startsWith("$argon2id$")).toBe(true);

    const access = res.cookies.get("omv_access_token");
    const refreshCookie = res.cookies.get("omv_refresh_token");
    expect(access?.value).toBeTruthy();
    expect(refreshCookie?.value).toBeTruthy();
    expect(access?.httpOnly).toBe(true);
    expect(refreshCookie?.httpOnly).toBe(true);

    // The refresh token is stored only as a hash.
    const hash = createHash("sha256").update(refreshCookie!.value).digest("hex");
    const session = await prisma.session.findUnique({ where: { refreshTokenHash: hash } });
    expect(session?.userId).toBe(user!.id);
  });

  it("rejects a short password and a duplicate email", async () => {
    const short = await register(
      jsonRequest("/api/auth/register", { body: { email: uniqueEmail(), password: "short", fullName: "X" } })
    );
    expect(short.status).toBe(400);

    const { email } = await makeUser();
    const dup = await register(
      jsonRequest("/api/auth/register", { body: { email, password: PASSWORD, fullName: "Dup" } })
    );
    expect(dup.status).toBe(409);
  });
});

describe("login", () => {
  it("logs in with correct credentials", async () => {
    const { email } = await makeUser();
    const res = await login(jsonRequest("/api/auth/login", { body: { email, password: PASSWORD } }));
    expect(res.status).toBe(200);
    expect(res.cookies.get("omv_access_token")?.value).toBeTruthy();
  });

  it("rejects a wrong password and an unknown email with the IDENTICAL response (no enumeration)", async () => {
    const { email } = await makeUser();
    const wrongPw = await login(jsonRequest("/api/auth/login", { body: { email, password: "nope-nope-nope" } }));
    const noUser = await login(
      jsonRequest("/api/auth/login", { body: { email: uniqueEmail("ghost"), password: "nope-nope-nope" } })
    );
    expect(wrongPw.status).toBe(401);
    expect(noUser.status).toBe(401);
    expect(await wrongPw.json()).toEqual(await noUser.json());
    expect(wrongPw.cookies.get("omv_access_token")?.value ?? "").toBe("");
  });

  it("rejects a deactivated account with the same generic response", async () => {
    const { email } = await makeUser();
    await prisma.user.update({ where: { email }, data: { isActive: false } });
    const res = await login(jsonRequest("/api/auth/login", { body: { email, password: PASSWORD } }));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("Invalid email or password.");
  });

  it("rate-limits repeated attempts from one client (429)", async () => {
    const ip = freshIp();
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) {
      const r = await login(
        jsonRequest("/api/auth/login", { body: { email: uniqueEmail("rl"), password: "x" }, ip })
      );
      statuses.push(r.status);
    }
    expect(statuses).toContain(429);
  });
});

describe("/me and session isolation", () => {
  it("returns the caller's own identity, and null when unauthenticated", async () => {
    const a = await makeUser();
    const b = await makeUser();
    const accessA = a.res.cookies.get("omv_access_token")!.value;
    const accessB = b.res.cookies.get("omv_access_token")!.value;

    const meA = await (await me(jsonRequest("/api/auth/me", { method: "GET", cookies: { omv_access_token: accessA } }))).json();
    const meB = await (await me(jsonRequest("/api/auth/me", { method: "GET", cookies: { omv_access_token: accessB } }))).json();
    expect(meA.user.email).toBe(a.email);
    expect(meB.user.email).toBe(b.email);
    expect(meA.user.id).not.toBe(meB.user.id);

    const anon = await (await me(jsonRequest("/api/auth/me", { method: "GET" }))).json();
    expect(anon.user).toBeNull();
  });

  it("a forged/garbage access token is rejected", async () => {
    const res = await me(
      jsonRequest("/api/auth/me", { method: "GET", cookies: { omv_access_token: "not.a.jwt" } })
    );
    expect((await res.json()).user).toBeNull();
  });
});


describe("session restoration (/me with an expired or absent access token)", () => {
  it("restores the session from a valid refresh cookie and re-issues an access cookie", async () => {
    const { email, res } = await makeUser();
    const refreshToken = res.cookies.get("omv_refresh_token")!.value;

    // Simulate an expired access token by sending ONLY the refresh cookie.
    const out = await me(
      jsonRequest("/api/auth/me", { method: "GET", cookies: { omv_refresh_token: refreshToken } })
    );
    const body = await out.json();
    expect(body.user.email).toBe(email);
    expect(out.cookies.get("omv_access_token")?.value).toBeTruthy();
  });

  it("does NOT restore from a revoked session", async () => {
    const { res } = await makeUser();
    const refreshToken = res.cookies.get("omv_refresh_token")!.value;
    await logout(jsonRequest("/api/auth/logout", { cookies: { omv_refresh_token: refreshToken } }));

    const out = await me(
      jsonRequest("/api/auth/me", { method: "GET", cookies: { omv_refresh_token: refreshToken } })
    );
    expect((await out.json()).user).toBeNull();
  });

  it("does NOT restore for a deactivated account", async () => {
    const { email, res } = await makeUser();
    await prisma.user.update({ where: { email }, data: { isActive: false } });
    const out = await me(
      jsonRequest("/api/auth/me", {
        method: "GET",
        cookies: { omv_refresh_token: res.cookies.get("omv_refresh_token")!.value },
      })
    );
    expect((await out.json()).user).toBeNull();
  });

  it("does NOT restore from an expired session", async () => {
    const { res } = await makeUser();
    const token = res.cookies.get("omv_refresh_token")!.value;
    const hash = createHash("sha256").update(token).digest("hex");
    await prisma.session.update({ where: { refreshTokenHash: hash }, data: { expiresAt: new Date(Date.now() - 1000) } });
    const out = await me(jsonRequest("/api/auth/me", { method: "GET", cookies: { omv_refresh_token: token } }));
    expect((await out.json()).user).toBeNull();
  });
});

describe("logout and session revocation", () => {
  it("revokes the session server-side so the refresh token stops working", async () => {
    const { res } = await makeUser();
    const refreshToken = res.cookies.get("omv_refresh_token")!.value;

    const out = await logout(
      jsonRequest("/api/auth/logout", { cookies: { omv_refresh_token: refreshToken } })
    );
    expect(out.status).toBe(200);

    const hash = createHash("sha256").update(refreshToken).digest("hex");
    const session = await prisma.session.findUnique({ where: { refreshTokenHash: hash } });
    expect(session?.revokedAt).not.toBeNull();

    // A stolen copy of that refresh token is now useless.
    const reuse = await refresh(
      jsonRequest("/api/auth/refresh", { cookies: { omv_refresh_token: refreshToken } })
    );
    expect(reuse.status).toBe(401);
  });

  it("revoking user A's session does not affect user B", async () => {
    const a = await makeUser();
    const b = await makeUser();
    await logout(
      jsonRequest("/api/auth/logout", { cookies: { omv_refresh_token: a.res.cookies.get("omv_refresh_token")!.value } })
    );
    const bRefresh = await refresh(
      jsonRequest("/api/auth/refresh", { cookies: { omv_refresh_token: b.res.cookies.get("omv_refresh_token")!.value } })
    );
    expect(bRefresh.status).toBe(200);
  });

  it("rotates the refresh token: the old one is invalid after use", async () => {
    const { res } = await makeUser();
    const oldToken = res.cookies.get("omv_refresh_token")!.value;
    const rotated = await refresh(jsonRequest("/api/auth/refresh", { cookies: { omv_refresh_token: oldToken } }));
    expect(rotated.status).toBe(200);
    const newToken = rotated.cookies.get("omv_refresh_token")!.value;
    expect(newToken).not.toBe(oldToken);

    const replay = await refresh(jsonRequest("/api/auth/refresh", { cookies: { omv_refresh_token: oldToken } }));
    expect(replay.status).toBe(401);
  });
});

describe("password recovery", () => {
  it("forgot-password returns the identical response for known and unknown emails", async () => {
    const { email } = await makeUser();
    const known = await forgotPassword(jsonRequest("/api/auth/forgot-password", { body: { email } }));
    const unknown = await forgotPassword(
      jsonRequest("/api/auth/forgot-password", { body: { email: uniqueEmail("ghost") } })
    );
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(await known.json()).toEqual(await unknown.json());

    // A token was created ONLY for the real account, stored hashed.
    const user = await prisma.user.findUnique({ where: { email } });
    const tokens = await prisma.passwordResetToken.findMany({ where: { userId: user!.id } });
    expect(tokens.length).toBe(1);
    expect(tokens[0]!.tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  async function issueResetToken(userId: string, expiresInMs: number) {
    const raw = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash: createHash("sha256").update(raw).digest("hex"),
        expiresAt: new Date(Date.now() + expiresInMs),
      },
    });
    return raw;
  }

  it("a valid token resets the password, is single-use, and revokes all sessions", async () => {
    const { email, res } = await makeUser();
    const user = await prisma.user.findUnique({ where: { email } });
    const raw = await issueResetToken(user!.id, 60_000);

    const ok = await resetPassword(
      jsonRequest("/api/auth/reset-password", { body: { token: raw, newPassword: "BrandNewPassw0rd!" } })
    );
    expect(ok.status).toBe(200);

    // New password works, old one doesn't.
    const newLogin = await login(jsonRequest("/api/auth/login", { body: { email, password: "BrandNewPassw0rd!" } }));
    expect(newLogin.status).toBe(200);
    const oldLogin = await login(jsonRequest("/api/auth/login", { body: { email, password: PASSWORD } }));
    expect(oldLogin.status).toBe(401);

    // The pre-reset session was revoked.
    const oldRefresh = res.cookies.get("omv_refresh_token")!.value;
    const hash = createHash("sha256").update(oldRefresh).digest("hex");
    const oldSession = await prisma.session.findUnique({ where: { refreshTokenHash: hash } });
    expect(oldSession?.revokedAt).not.toBeNull();

    // Single use: replaying the same token fails.
    const replay = await resetPassword(
      jsonRequest("/api/auth/reset-password", { body: { token: raw, newPassword: "AnotherPassw0rd!" } })
    );
    expect(replay.status).toBe(400);
  });

  it("an expired token is rejected and does not change the password", async () => {
    const { email } = await makeUser();
    const user = await prisma.user.findUnique({ where: { email } });
    const raw = await issueResetToken(user!.id, -1000); // already expired

    const res = await resetPassword(
      jsonRequest("/api/auth/reset-password", { body: { token: raw, newPassword: "ShouldNeverApply1!" } })
    );
    expect(res.status).toBe(400);
    const stillOld = await login(jsonRequest("/api/auth/login", { body: { email, password: PASSWORD } }));
    expect(stillOld.status).toBe(200);
  });

  it("an unknown token is rejected with the same generic message", async () => {
    const res = await resetPassword(
      jsonRequest("/api/auth/reset-password", { body: { token: "f".repeat(64), newPassword: "WhateverPassw0rd!" } })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("This reset link is invalid or has expired.");
  });
});
