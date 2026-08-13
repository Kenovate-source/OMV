"use client";

import { Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useAdminCustomers } from "@/lib/admin/admin-customers-context";
import { formatNaira } from "@/lib/data/products";

export default function AdminCustomersPage() {
  const { customers, toggleStatus } = useAdminCustomers();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Users className="text-primary" aria-hidden="true" />
        <div>
          <h1 className="font-serif text-3xl text-foreground">Customers</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Illustrative customer directory — connects to real accounts in Phase 5.
          </p>
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-foreground-muted">
              <th className="px-5 py-4 font-normal">Name</th>
              <th className="px-5 py-4 font-normal">Email</th>
              <th className="px-5 py-4 font-normal">Orders</th>
              <th className="px-5 py-4 font-normal">Total Spend</th>
              <th className="px-5 py-4 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-5 py-4 text-foreground">{c.name}</td>
                <td className="px-5 py-4 text-foreground-muted">{c.email}</td>
                <td className="px-5 py-4 text-foreground-muted">{c.orders}</td>
                <td className="px-5 py-4 text-foreground-muted">{formatNaira(c.totalSpend)}</td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => toggleStatus(c.id)}
                    aria-label={`Toggle status for ${c.name}, currently ${c.status}`}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      c.status === "Active"
                        ? "border-primary text-primary"
                        : "border-red-400 text-red-400"
                    )}
                  >
                    {c.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
