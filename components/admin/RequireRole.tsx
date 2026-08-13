"use client";

import { ShieldAlert } from "lucide-react";
import { useAdminAuth, type AdminRole } from "@/lib/admin/admin-auth-context";

export function RequireRole({
  roles,
  children,
}: {
  roles: AdminRole[];
  children: React.ReactNode;
}) {
  const { can, currentAdmin } = useAdminAuth();

  // AdminShell already renders the login picker instead of page content
  // when nobody is signed in, so this branch is a defensive fallback.
  if (!currentAdmin) return null;

  if (!can(roles)) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface-elevated p-16 text-center">
        <ShieldAlert size={28} className="text-foreground-muted" aria-hidden="true" />
        <p className="text-sm text-foreground-muted">
          Your role ({currentAdmin.role}) doesn&apos;t have access to this
          section.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
