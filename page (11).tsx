"use client";

import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RequireRole } from "@/components/admin/RequireRole";
import { useOrders } from "@/lib/orders/order-context";
import { formatNaira } from "@/lib/data/products";

export default function AdminReportsPage() {
  const { orders } = useOrders();

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrder = orders.length ? Math.round(revenue / orders.length) : 0;

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const productTotals = new Map<string, number>();
  orders.forEach((o) =>
    o.items.forEach((item) => {
      productTotals.set(item.name, (productTotals.get(item.name) ?? 0) + item.qty);
    })
  );
  const topProducts = [...productTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <RequireRole roles={["super", "business"]}>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-primary" aria-hidden="true" />
          <div>
            <h1 className="font-serif text-3xl text-foreground">Reports</h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Derived from real local order history.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs text-foreground-muted">Total Revenue</p>
            <p className="mt-1 font-serif text-2xl text-foreground">{formatNaira(revenue)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-foreground-muted">Orders</p>
            <p className="mt-1 font-serif text-2xl text-foreground">{orders.length}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-foreground-muted">Avg. Order Value</p>
            <p className="mt-1 font-serif text-2xl text-foreground">{formatNaira(avgOrder)}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="mb-4 font-serif text-lg text-foreground">Orders by Status</h2>
          {Object.keys(statusCounts).length === 0 ? (
            <p className="text-sm text-foreground-muted">No orders yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <li key={status} className="flex justify-between text-sm">
                  <span className="text-foreground-muted">{status}</span>
                  <span className="text-foreground">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-serif text-lg text-foreground">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-foreground-muted">No sales data yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {topProducts.map(([name, qty]) => (
                <li key={name} className="flex justify-between text-sm">
                  <span className="text-foreground-muted">{name}</span>
                  <span className="text-foreground">{qty} sold</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </RequireRole>
  );
}
