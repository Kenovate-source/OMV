import { NextRequest, NextResponse } from "next/server";
import { guarded } from "@/lib/server/http";
import { requireAdminRole } from "@/lib/server/auth/rbac";
import { restoreAdminFromRefresh } from "@/lib/server/auth/session";
import { ADMIN_ACCESS_COOKIE, accessCookieOptions } from "@/lib/server/auth/cookies";

export const GET = guarded("admin.me", async (request: NextRequest) => {
  // All three roles may ask "who am I" — role restriction here would
  // defeat the purpose. Per-action restriction happens in each admin
  // route handler, not here.
  const result = await requireAdminRole(request, ["SUPER", "BUSINESS", "STAFF"]);
  if (result.ok) {
    return NextResponse.json({ admin: result.admin });
  }

  // Access token missing/expired: try to silently restore from the admin
  // refresh cookie (see lib/server/auth/session.ts).
  const restored = await restoreAdminFromRefresh(request);
  if (!restored) {
    return NextResponse.json({ admin: null }, { status: 200 });
  }

  const { admin, accessToken } = restored;
  const res = NextResponse.json({
    admin: { id: admin.id, email: admin.email, fullName: admin.fullName, role: admin.role },
  });
  res.cookies.set(ADMIN_ACCESS_COOKIE, accessToken, accessCookieOptions);
  return res;
}, () => NextResponse.json({ admin: null }));
