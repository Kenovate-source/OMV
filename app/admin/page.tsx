"use client";

import Link from "next/link";
import { LayoutDashboard, Boxes, Package, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAdminProducts } from "@/lib/admin/admin-products-context";
import { useOrders } from "@/lib/orders/order-context";
import { useAdminReviews } from "@/lib/admin/admin-reviews-context";
import { formatNaira } from "@/lib/data/products";

export default function AdminDashboardPage() {
  const { products } = useAdminProducts();
  const { orders } = useOrders();
  const { reviews } = useAdminReviews();

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStock = products.filter((p) => p.stock < 15).length;
  const pendingReviews = reviews.filter((r) => r.status === "Pending").length;

  const stats = [
    { label: "Total Orders", value: String(orders.length), href: "/admin/orders", icon: Package },
    { label: "Revenue", value: formatNaira(revenue), href: "/admin/reports", icon: LayoutDashboard },
    { label: "Products", value: String(products.length), href: "/admin/products", icon: Boxes },
    { label: "Low Stock", value: String(lowStock), href: "/admin/inventory", icon: Boxes },
    { label: "Pending Reviews", value: String(pendingReviews), href: "/admin/reviews", icon: Star },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          A snapshot of what needs attention across the store.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href} aria-label={`${label}: ${value}`}>
            <Card className="flex items-center gap-4 p-5">
              <Icon className="text-primary" aria-hidden="true" />
              <div>
                <p className="font-serif text-xl text-foreground">{value}</p>
                <p className="text-xs text-foreground-muted">{label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

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
    </div>
  );
}
