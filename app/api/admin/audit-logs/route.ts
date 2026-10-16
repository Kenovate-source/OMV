import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { requireAdminRole } from "@/lib/server/auth/rbac";

// The first genuinely RBAC-enforced admin endpoint. Per the locked RBAC
// matrix, ONLY Super Admin may read audit logs — Business and Staff
// are rejected here on the server regardless of what the UI shows or
// hides. This is the concrete proof point for "the browser must never
// be the authority for these permissions": a Staff Admin crafting this
// exact request by hand gets a 403, same as if they'd clicked a link
// the UI never offered them.
export async function GET(request: NextRequest) {
  const auth = await requireAdminRole(request, ["SUPER"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { adminUser: { select: { fullName: true } } },
  });

  return NextResponse.json({
    entries: entries.map((e) => ({
      id: e.id,
      timestamp: e.createdAt,
      adminName: e.adminUser.fullName,
      action: e.action,
    })),
  });
}
