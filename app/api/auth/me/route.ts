import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/server/auth/rbac";

export async function GET(request: NextRequest) {
  const result = await requireCustomer(request);
  if (!result.ok) {
    // 200 with user: null, not 401 — "am I logged in?" is a normal
    // query the UI makes on every page load, not an error condition.
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const { user } = result;
  return NextResponse.json({
    user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone },
  });
}
