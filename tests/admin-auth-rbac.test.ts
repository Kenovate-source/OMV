// Admin authentication + server-side RBAC. REAL integration tests against
// a REAL Postgres database. Status: WRITTEN, NOT YET EXECUTED (authoring
// sandbox has no network/database access — see IMPLEMENTATION_LOG.md).
//
// The core claim under test: authorization is enforced by the SERVER on
// every request, independent of anything the UI shows or hides. Each test
// calls the Route Handler directly — exactly what a malicious client
// bypassing the UI would do.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { SignJWT } from "jose";
import { prisma } from "@/lib/server/prisma";
import { hashPassword } from "@/lib/server/auth/passwords";
import { POST as adminLogin } from "@/app/api/admin/auth/login/route";
import { POST as adminLogout } from "@/app/api/admin/auth/logout/route";
import { GET as adminMe } from "@/app/api/admin/auth/me/route";
import { GET as auditLogs } from "@/app/api/admin/audit-logs/route";
import { POST as customerRegister } from "@/app/api/auth/register/route";
import { GET as customerMe } from "@/app/api/auth/me/route";
import { jsonRequest, uniqueEmail } from "./helpers";

const PASSWORD = "AdminTestPassw0rd!";
const adminEmails: string[] = [];
const customerEmails: string[] = [];

type Role = "SUPER" | "BUSINESS" | "STAFF";
const admins = {} as Record<Role, { id: string; email: string; cookie: string }>;

async function createAdmin(role: Role) {
  const email = uniqueEmail(`admin-${role.toLowerCase()}`);
  adminEmails.push(email);
  const admin = await prisma.adminUser.create({
    data: { email, fullName: `Test ${role}`, role, passwordHash: await hashPassword(PASSWORD) },
  });
  const res = await adminLogin(jsonRequest("/api/admin/auth/login", { body: { email, password: PASSWORD } }));
  expect(res.status).toBe(200);
  return { id: admin.id, email, cookie: res.cookies.get("omv_admin_access_token")!.value };
}

beforeAll(async () => {
  for (const role of ["SUPER", "BUSINESS", "STAFF"] as Role[]) {
    admins[role] = await createAdmin(role);
  }
});

afterAll(async () => {
  await prisma.adminUser.deleteMany({ where: { email: { in: adminEmails } } });
  await prisma.user.deleteMany({ where: { email: { in: customerEmails } } });
  await prisma.$disconnect();
});

describe("admin authentication (database-backed, not the old signInAs prototype)", () => {
  it("signs in each seeded role against the database and sets httpOnly admin cookies", async () => {
    const res = await adminLogin(
      jsonRequest("/api/admin/auth/login", { body: { email: admins.SUPER.email, password: PASSWORD } })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).admin.role).toBe("SUPER");
    expect(res.cookies.get("omv_admin_access_token")?.httpOnly).toBe(true);
    expect(res.cookies.get("omv_admin_refresh_token")?.httpOnly).toBe(true);
  });

  it("rejects a wrong password and an unknown admin identically (no enumeration)", async () => {
    const wrong = await adminLogin(
      jsonRequest("/api/admin/auth/login", { body: { email: admins.STAFF.email, password: "wrong-wrong-wrong" } })
    );
    const unknown = await adminLogin(
      jsonRequest("/api/admin/auth/login", { body: { email: uniqueEmail("nobody"), password: "wrong-wrong-wrong" } })
    );
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(await wrong.json()).toEqual(await unknown.json());
  });

  it("an admin session can be revoked at logout", async () => {
    const login = await adminLogin(
      jsonRequest("/api/admin/auth/login", { body: { email: admins.BUSINESS.email, password: PASSWORD } })
    );
    const refreshToken = login.cookies.get("omv_admin_refresh_token")!.value;
    const out = await adminLogout(
      jsonRequest("/api/admin/auth/logout", { cookies: { omv_admin_refresh_token: refreshToken } })
    );
    expect(out.status).toBe(200);
    const revoked = await prisma.session.findMany({
      where: { adminUserId: admins.BUSINESS.id, revokedAt: { not: null } },
    });
    expect(revoked.length).toBeGreaterThan(0);
  });

  it("/admin/auth/me identifies each role correctly", async () => {
    for (const role of ["SUPER", "BUSINESS", "STAFF"] as Role[]) {
      const res = await adminMe(
        jsonRequest("/api/admin/auth/me", { method: "GET", cookies: { omv_admin_access_token: admins[role].cookie } })
      );
      expect((await res.json()).admin.role).toBe(role);
    }
  });
});


describe("admin session restoration (/admin/auth/me with an expired or absent access token)", () => {
  it("restores an admin session from a valid refresh cookie, with the CURRENT database role", async () => {
    const login = await adminLogin(
      jsonRequest("/api/admin/auth/login", { body: { email: admins.BUSINESS.email, password: PASSWORD } })
    );
    const refreshToken = login.cookies.get("omv_admin_refresh_token")!.value;

    const out = await adminMe(
      jsonRequest("/api/admin/auth/me", { method: "GET", cookies: { omv_admin_refresh_token: refreshToken } })
    );
    const body = await out.json();
    expect(body.admin.role).toBe("BUSINESS");
    expect(out.cookies.get("omv_admin_access_token")?.value).toBeTruthy();
  });

  it("does NOT restore after logout (revoked) or for a deactivated admin", async () => {
    const a = await createAdmin("STAFF");
    const login = await adminLogin(
      jsonRequest("/api/admin/auth/login", { body: { email: a.email, password: PASSWORD } })
    );
    const refreshToken = login.cookies.get("omv_admin_refresh_token")!.value;

    await prisma.adminUser.update({ where: { id: a.id }, data: { isActive: false } });
    const deactivated = await adminMe(
      jsonRequest("/api/admin/auth/me", { method: "GET", cookies: { omv_admin_refresh_token: refreshToken } })
    );
    expect((await deactivated.json()).admin).toBeNull();

    await prisma.adminUser.update({ where: { id: a.id }, data: { isActive: true } });
    await adminLogout(jsonRequest("/api/admin/auth/logout", { cookies: { omv_admin_refresh_token: refreshToken } }));
    const revoked = await adminMe(
      jsonRequest("/api/admin/auth/me", { method: "GET", cookies: { omv_admin_refresh_token: refreshToken } })
    );
    expect((await revoked.json()).admin).toBeNull();
  });

  it("a CUSTOMER refresh cookie can never restore an ADMIN session", async () => {
    const email = uniqueEmail("cust");
    customerEmails.push(email);
    const reg = await customerRegister(
      jsonRequest("/api/auth/register", { body: { email, password: "CustomerPassw0rd!", fullName: "Cust" } })
    );
    const customerRefresh = reg.cookies.get("omv_refresh_token")!.value;
    const out = await adminMe(
      jsonRequest("/api/admin/auth/me", { method: "GET", cookies: { omv_admin_refresh_token: customerRefresh } })
    );
    expect((await out.json()).admin).toBeNull();
  });
});

describe("server-side RBAC on a restricted endpoint (GET /api/admin/audit-logs — SUPER only)", () => {
  it("rejects an unauthenticated request with 401", async () => {
    const res = await auditLogs(jsonRequest("/api/admin/audit-logs", { method: "GET" }));
    expect(res.status).toBe(401);
  });

  it("allows SUPER", async () => {
    const res = await auditLogs(
      jsonRequest("/api/admin/audit-logs", { method: "GET", cookies: { omv_admin_access_token: admins.SUPER.cookie } })
    );
    expect(res.status).toBe(200);
    expect(Array.isArray((await res.json()).entries)).toBe(true);
  });

  it("FORBIDS BUSINESS (403) — even though a valid, authenticated admin", async () => {
    const res = await auditLogs(
      jsonRequest("/api/admin/audit-logs", { method: "GET", cookies: { omv_admin_access_token: admins.BUSINESS.cookie } })
    );
    expect(res.status).toBe(403);
  });

  it("FORBIDS STAFF (403)", async () => {
    const res = await auditLogs(
      jsonRequest("/api/admin/audit-logs", { method: "GET", cookies: { omv_admin_access_token: admins.STAFF.cookie } })
    );
    expect(res.status).toBe(403);
  });

  it("a role change in the database takes effect immediately, not when the old token expires", async () => {
    const created = await createAdmin("SUPER");
    const before = await auditLogs(
      jsonRequest("/api/admin/audit-logs", { method: "GET", cookies: { omv_admin_access_token: created.cookie } })
    );
    expect(before.status).toBe(200);

    // Demote in the DB. The JWT still CLAIMS role=SUPER and is still
    // unexpired — the server must trust the database, not the token.
    await prisma.adminUser.update({ where: { id: created.id }, data: { role: "STAFF" } });
    const after = await auditLogs(
      jsonRequest("/api/admin/audit-logs", { method: "GET", cookies: { omv_admin_access_token: created.cookie } })
    );
    expect(after.status).toBe(403);
  });

  it("a deactivated admin is locked out immediately even with a valid token", async () => {
    const created = await createAdmin("SUPER");
    await prisma.adminUser.update({ where: { id: created.id }, data: { isActive: false } });
    const res = await auditLogs(
      jsonRequest("/api/admin/audit-logs", { method: "GET", cookies: { omv_admin_access_token: created.cookie } })
    );
    expect(res.status).toBe(401);
  });

  it("a forged token claiming role=SUPER, signed with the wrong secret, is rejected", async () => {
    const forged = await new SignJWT({ sub: admins.STAFF.id, type: "admin", role: "SUPER" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode("attacker-guessed-secret"));
    const res = await auditLogs(
      jsonRequest("/api/admin/audit-logs", { method: "GET", cookies: { omv_admin_access_token: forged } })
    );
    expect(res.status).toBe(401);
  });

  it("a token correctly signed but self-asserting SUPER for a STAFF account is still 403 (DB role wins)", async () => {
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
    const escalated = await new SignJWT({ sub: admins.STAFF.id, type: "admin", role: "SUPER" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(secret);
    const res = await auditLogs(
      jsonRequest("/api/admin/audit-logs", { method: "GET", cookies: { omv_admin_access_token: escalated } })
    );
    expect(res.status).toBe(403);
  });
});

describe("customer / admin session isolation", () => {
  it("a customer access token cannot authenticate to an admin endpoint", async () => {
    const email = uniqueEmail("cust");
    customerEmails.push(email);
    const reg = await customerRegister(
      jsonRequest("/api/auth/register", { body: { email, password: "CustomerPassw0rd!", fullName: "Cust" } })
    );
    const customerToken = reg.cookies.get("omv_access_token")!.value;

    // Presented in the ADMIN cookie slot: rejected on token `type`.
    const res = await auditLogs(
      jsonRequest("/api/admin/audit-logs", { method: "GET", cookies: { omv_admin_access_token: customerToken } })
    );
    expect(res.status).toBe(401);
  });

  it("an admin access token cannot authenticate as a customer", async () => {
    const res = await customerMe(
      jsonRequest("/api/auth/me", { method: "GET", cookies: { omv_access_token: admins.SUPER.cookie } })
    );
    expect((await res.json()).user).toBeNull();
  });
});
