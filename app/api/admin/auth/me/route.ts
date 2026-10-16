import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/server/auth/rbac";

export async function GET(request: NextRequest) {
  // All three roles may ask "who am I" — role restriction here would
  // defeat the purpose. Per-action restriction happens in each admin
  // route handler, not here.
  const result = await requireAdminRole(request, ["SUPER", "BUSINESS", "STAFF"]);
  if (!result.ok) {
    return NextResponse.json({ admin: null }, { status: 200 });
  }
  return NextResponse.json({ admin: result.admin });
}
