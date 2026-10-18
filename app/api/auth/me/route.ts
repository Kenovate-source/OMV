import { NextRequest, NextResponse } from "next/server";
import { guarded } from "@/lib/server/http";
import { requireCustomer } from "@/lib/server/auth/rbac";
import { restoreCustomerFromRefresh } from "@/lib/server/auth/session";
import { CUSTOMER_ACCESS_COOKIE, accessCookieOptions } from "@/lib/server/auth/cookies";

export const GET = guarded("auth.me", async (request: NextRequest) => {
  const result = await requireCustomer(request);
  if (result.ok) {
    const { user } = result;
    return NextResponse.json({
      user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone },
    });
  }

  // Access token missing/expired: try to silently restore from the
  // refresh cookie (see lib/server/auth/session.ts).
  const restored = await restoreCustomerFromRefresh(request);
  if (!restored) {
    // 200 with user: null, not 401 — "am I logged in?" is a normal
    // query the UI makes on every page load, not an error condition.
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const { user, accessToken } = restored;
  const res = NextResponse.json({
    user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone },
  });
  res.cookies.set(CUSTOMER_ACCESS_COOKIE, accessToken, accessCookieOptions);
  return res;
}, () => NextResponse.json({ user: null }));
