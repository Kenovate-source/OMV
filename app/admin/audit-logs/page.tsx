"use client";

import { ScrollText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RequireRole } from "@/components/admin/RequireRole";
import { useAdminAudit } from "@/lib/admin/admin-audit-context";

export default function AdminAuditLogsPage() {
  const { entries } = useAdminAudit();

  return (
    <RequireRole roles={["super"]}>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <ScrollText className="text-primary" aria-hidden="true" />
          <div>
            <h1 className="font-serif text-3xl text-foreground">Audit Logs</h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Every admin action taken across this portal, most recent first.
            </p>
          </div>
        </div>

        {entries.length === 0 ? (
          <p className="rounded-card border border-border bg-surface-elevated p-8 text-center text-sm text-foreground-muted">
            No actions logged yet — try adjusting stock, adding a product, or
            moderating a review.
          </p>
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-foreground-muted">
                  <th className="px-5 py-4 font-normal">Time</th>
                  <th className="px-5 py-4 font-normal">Admin</th>
                  <th className="px-5 py-4 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4 text-foreground-muted">
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-foreground">{e.adminName}</td>
                    <td className="px-5 py-4 text-foreground-muted">{e.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </RequireRole>
  );
}
