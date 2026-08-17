"use client";

import Link from "next/link";
import { Package, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { OrderTracker } from "@/components/account/OrderTracker";
import { useOrders } from "@/lib/orders/order-context";
import { formatNaira } from "@/lib/data/products";

export default function OrdersPage() {
  const { orders } = useOrders();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Orders</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Track and review everything you&apos;ve ordered.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-card border border-border bg-surface-elevated p-16 text-center">
          <Package size={32} className="text-foreground-muted" aria-hidden="true" />
          <p className="text-sm text-foreground-muted">
            No orders yet — checkout to see your order history here.
          </p>
          <Link href="/women" className={buttonVariants({ variant: "primary" })}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-6">
          {orders.map((order) => (
            <li key={order.id}>
              <Card className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-serif text-base text-foreground">{order.id}</p>
                    <p className="text-xs text-foreground-muted">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-gold">{formatNaira(order.total)}</p>
                </div>

                <div className="mt-6">
                  {order.status === "Cancelled" ? (
                    <div className="flex items-center gap-2 rounded-input border border-red-400/30 bg-red-400/5 px-4 py-3 text-xs text-red-400">
                      <XCircle size={14} aria-hidden="true" />
                      This order was cancelled.
                    </div>
                  ) : (
                    <OrderTracker status={order.status} />
                  )}
                </div>

                <ul className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
                  {order.items.map((item) => (
                    <li
                      key={`${item.productId}-${item.color}-${item.size}`}
                      className="flex justify-between text-xs text-foreground-muted"
                    >
                      <span>
                        {item.name} × {item.qty} ({item.color}, {item.size})
                      </span>
                      <span>{formatNaira(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
