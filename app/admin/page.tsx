"use client";

import Link from "next/link";
import { LayoutDashboard, Boxes, Package, Star, Users, ScrollText, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useInventory } from "@/lib/inventory/inventory-context";
import { useOrders } from "@/lib/orders/order-context";
import { useAdminReviews } from "@/lib/admin/admin-reviews-context";
import { useAdminCustomers } from "@/lib/admin/admin-customers-context";
import { useAdminAudit } from "@/lib/admin/admin-audit-context";
import { useAdminAuth } from "@/lib/admin/admin-auth-context";
import { formatNaira } from "@/lib/data/products";

const LOW_STOCK_THRESHOLD = 5;

function StatCard({
  href,
  icon: Icon,
  value,
  label,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  value: string;
  label: string;
}) {
  return (
    <Link href={href} aria-label={`${label}: ${value}`}>
      <Card className="flex items-center gap-4 p-5">
        <Icon className="text-primary" aria-hidden="true" />
        <div>
          <p className="font-serif text-xl text-foreground">{value}</p>
          <p className="text-xs text-foreground-muted">{label}</p>
        </div>
      </Card>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { currentAdmin } = useAdminAuth();
  const { products } = useInventory();
  const { orders } = useOrders();
  const { reviews } = useAdminReviews();
  const { customers } = useAdminCustomers();
  const { entries } = useAdminAudit();

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockCount = products.reduce(
    (count, p) =>
      count + p.variants.filter((v) => v.stock > 0 && v.stock < LOW_STOCK_THRESHOLD).length,
    0
  );
  const pendingReviews = reviews.filter((r) => r.status === "Pending").length;
  const attentionOrders = orders.filter(
    (o) => o.status === "Placed" || o.status === "Processing"
  ).length;

  const role = currentAdmin?.role ?? "staff";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          {role === "staff"
            ? "Today's operational picture — orders, stock, and customers."
            : "A snapshot of what needs attention across the store."}
        </p>
      </div>

      {role === "staff" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard href="/admin/orders" icon={Package} value={String(orders.length)} label="Total Orders" />
            <StatCard
              href="/admin/orders"
              icon={AlertCircle}
              value={String(attentionOrders)}
              label="Orders Needing Attention"
            />
            <StatCard href="/admin/inventory" icon={Boxes} value={String(lowStockCount)} label="Low Stock Variants" />
            <StatCard href="/admin/customers" icon={Users} value={String(customers.length)} label="Customers" />
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard href="/admin/orders" icon={Package} value={String(orders.length)} label="Total Orders" />
          <StatCard href="/admin/reports" icon={LayoutDashboard} value={formatNaira(revenue)} label="Revenue" />
          <StatCard href="/admin/products" icon={Boxes} value={String(products.length)} label="Products" />
          <StatCard href="/admin/inventory" icon={Boxes} value={String(lowStockCount)} label="Low Stock Variants" />
          <StatCard href="/admin/reviews" icon={Star} value={String(pendingReviews)} label="Pending Reviews" />
        </div>
      )}

      <Card className="p-6">
        <h2 className="mb-4 font-serif text-lg text-foreground">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-foreground-muted">No orders placed yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span className="text-foreground">{o.id}</span>
                <span className="text-foreground-muted">{o.status}</span>
                <span className="text-gold">{formatNaira(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {role === "super" && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <ScrollText size={16} className="text-primary" aria-hidden="true" />
            <h2 className="font-serif text-lg text-foreground">Recent Admin Activity</h2>
          </div>
          {entries.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              No actions logged yet.{" "}
              <Link href="/admin/audit-logs" className="text-gold hover:underline">
                View full audit log
              </Link>
            </p>
          ) : (
            <>
              <ul className="flex flex-col divide-y divide-border">
                {entries.slice(0, 5).map((e) => (
                  <li key={e.id} className="flex flex-wrap justify-between gap-2 py-3 text-xs">
                    <span className="text-foreground-muted">{e.adminName}</span>
                    <span className="text-foreground">{e.action}</span>
                  </li>
                ))}
              </ul>
              <Link href="/admin/audit-logs" className="mt-4 inline-block text-xs text-gold hover:underline">
                View full audit log →
              </Link>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
