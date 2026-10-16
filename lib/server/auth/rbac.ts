// lib/server/auth/rbac.ts
//
// THE server-side RBAC enforcement point. Every admin Route Handler that
// needs role restriction calls requireAdminRole() and checks the result
// BEFORE touching any data — this is what makes the restriction real,
// as opposed to Phase 4.2's RequireRole, which only hid UI and enforced
// nothing. A malicious client calling an admin API route directly,
// bypassing the UI entirely, hits this same check and is rejected the
// same way.

import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAccessToken } from "./tokens";
import { ADMIN_ACCESS_COOKIE, CUSTOMER_ACCESS_COOKIE } from "./cookies";
import type { AdminRole } from "@prisma/client";

export interface AuthorizedAdmin {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
}

export type RbacResult =
  | { ok: true; admin: AuthorizedAdmin }
  | { ok: false; status: 401 | 403; message: string };

export async function requireAdminRole(
  request: NextRequest,
  allowedRoles: AdminRole[]
): Promise<RbacResult> {
  const token = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!token) return { ok: false, status: 401, message: "Not authenticated." };

  const payload = await verifyAccessToken(token);
  if (!payload || payload.type !== "admin") {
    return { ok: false, status: 401, message: "Not authenticated." };
  }

  // Re-fetch the admin's CURRENT role from the database rather than
  // trusting the JWT's embedded role claim alone — a role change (or
  // deactivation) must take effect immediately, not only after the old
  // access token expires (~15 minutes). This is the difference between
  // "the browser says I'm Super Admin" and genuine server-side
  // authorization.
  const admin = await prisma.adminUser.findUnique({ where: { id: payload.sub } });
  if (!admin || !admin.isActive) {
    return { ok: false, status: 401, message: "Account is not active." };
  }
  if (!allowedRoles.includes(admin.role)) {
    return { ok: false, status: 403, message: "Your role does not have access to this action." };
  }

  return {
    ok: true,
    admin: { id: admin.id, email: admin.email, fullName: admin.fullName, role: admin.role },
  };
}

// Same pattern for a logged-in customer — re-fetches from DB so a
// deactivated account (User.isActive = false) is rejected immediately,
// not only once its access token naturally expires.
export async function requireCustomer(request: NextRequest) {
  const token = request.cookies.get(CUSTOMER_ACCESS_COOKIE)?.value;
  if (!token) return { ok: false as const, status: 401 as const, message: "Not authenticated." };

  const payload = await verifyAccessToken(token);
  if (!payload || payload.type !== "customer") {
    return { ok: false as const, status: 401 as const, message: "Not authenticated." };
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) {
    return { ok: false as const, status: 401 as const, message: "Account is not active." };
  }

  return { ok: true as const, user };
}
