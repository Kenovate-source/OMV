"use client";

import { XCircle, Package } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { OrderTracker } from "@/components/account/OrderTracker";
import { useOrders, type OrderStatus, type Order } from "@/lib/orders/order-context";
import { useInventory, type StockLineRequest } from "@/lib/inventory/inventory-context";
import { useAdminAudit } from "@/lib/admin/admin-audit-context";
import { useAdminAuth } from "@/lib/admin/admin-auth-context";
import { formatNaira } from "@/lib/data/products";

const STATUSES: OrderStatus[] = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"];

function orderToStockLines(order: Order): StockLineRequest[] {
  return order.items.map((item) => ({
    productId: item.productId,
    color: item.color,
    size: item.size,
    qty: item.qty,
  }));
}

export default function AdminOrdersPage() {
  const { orders, updateStatus } = useOrders();
  const { restoreStock } = useInventory();
  const { logAction } = useAdminAudit();
  const { currentAdmin } = useAdminAuth();

  function handleChange(order: Order, status: OrderStatus) {
    const wasCancelled = order.status === "Cancelled";
    const isCancelling = status === "Cancelled";

    updateStatus(order.id, status);

    // Restore the exact stock this order deducted, once, the moment it
    // transitions INTO Cancelled. Phase 5's real business rules may add
    // conditions (return windows, restocking fees, etc.) — this is the
    // mechanical restore only, and only fires on the transition, not on
    // every re-save while already Cancelled.
    if (isCancelling && !wasCancelled) {
      restoreStock(orderToStockLines(order));
      if (currentAdmin) {
        logAction(currentAdmin.name, `Cancelled order ${order.id} and restored variant stock`);
      }
    } else if (currentAdmin) {
      logAction(currentAdmin.name, `Set order ${order.id} status to ${status}`);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Package className="text-primary" aria-hidden="true" />
        <div>
          <h1 className="font-serif text-3xl text-foreground">Orders</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            All orders placed in this browser session — the same history
            customers see in their own dashboard. Cancelling an order
            automatically restores the stock it deducted.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-card border border-border bg-surface-elevated p-8 text-center text-sm text-foreground-muted">
          No orders yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {orders.map((o) => (
            <li key={o.id}>
              <Card className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-serif text-base text-foreground">{o.id}</p>
                    <p className="text-xs text-foreground-muted">
                      {new Date(o.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-gold">{formatNaira(o.total)}</p>
                  <label className="sr-only" htmlFor={`status-${o.id}`}>
                    Update status for order {o.id}
                  </label>
                  <select
                    id={`status-${o.id}`}
                    value={o.status}
                    onChange={(e) => handleChange(o, e.target.value as OrderStatus)}
                    className="h-9 rounded-input border border-border bg-surface px-3 text-xs text-foreground"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-6">
                  {o.status === "Cancelled" ? (
                    <div className="flex items-center gap-2 rounded-input border border-red-400/30 bg-red-400/5 px-4 py-3 text-xs text-red-400">
                      <XCircle size={14} aria-hidden="true" />
                      Order cancelled — variant stock has been restored.
                    </div>
                  ) : (
                    <OrderTracker status={o.status} />
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
