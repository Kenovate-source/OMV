"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/cart/cart-context";
import { useOrders } from "@/lib/orders/order-context";
import { PRODUCTS, formatNaira } from "@/lib/data/products";

export default function CheckoutPage() {
  const { lines, clear } = useCart();
  const { addOrder } = useOrders();
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const rows = lines
    .map((line) => ({ line, product: PRODUCTS.find((p) => p.id === line.productId) }))
    .filter((r): r is { line: typeof lines[number]; product: NonNullable<typeof r.product> } => Boolean(r.product));
  const subtotal = rows.reduce((sum, r) => sum + r.product.price * r.line.qty, 0);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Phase 5 will POST this to the real orders API and integrate a payment
    // gateway. For now, Phase 3 persists the order into the local order
    // history (lib/orders/order-context.tsx) so the Customer Dashboard's
    // Orders, Order Tracking and Loyalty pages have real data to show —
    // the full flow can be reviewed end to end today.
    const id = `OMV-${Date.now().toString().slice(-8)}`;
    addOrder({
      id,
      date: new Date().toISOString(),
      total: subtotal,
      items: rows.map((r) => ({
        productId: r.product.id,
        name: r.product.name,
        size: r.line.size,
        qty: r.line.qty,
        price: r.product.price,
      })),
    });
    setOrderId(id);
    setPlaced(true);
    clear();
  }

  if (placed) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
        <CheckCircle2 size={40} className="text-gold" aria-hidden="true" />
        <h1 className="mt-6 font-serif text-3xl text-foreground">Order placed</h1>
        <p className="mt-3 text-sm text-foreground-muted">
          Reference <span className="text-gold">{orderId}</span>. Email/SMS
          confirmation will connect to the real backend in Phase 5 — you can
          already track this order&apos;s status in your dashboard.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/account/orders" className={cn(buttonVariants({ variant: "primary" }))}>
            View Order
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-serif text-2xl text-foreground">Your bag is empty</h1>
        <p className="mt-3 text-sm text-foreground-muted">Add something to your bag before checking out.</p>
        <Link href="/women" className={cn(buttonVariants({ variant: "primary" }), "mt-6")}>
          Browse the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-serif text-3xl text-foreground">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-4 font-serif text-lg text-foreground">Shipping Address</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Full name" name="fullName" autoComplete="name" required />
              <Input label="Phone number" name="phone" type="tel" autoComplete="tel" required />
              <div className="sm:col-span-2">
                <Input label="Address" name="address" autoComplete="street-address" required />
              </div>
              <Input label="City" name="city" autoComplete="address-level2" required />
              <Input label="State" name="state" autoComplete="address-level1" required />
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-lg text-foreground">Payment</h2>
            <div className="rounded-card border border-dashed border-border bg-surface-elevated p-6 text-sm text-foreground-muted">
              Payment gateway integration (card, bank transfer) is wired up in
              Phase 5, alongside the real orders API. This step is a
              placeholder so the full checkout flow can be reviewed now.
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-card border border-border bg-surface-elevated p-6">
          <h2 className="font-serif text-lg text-foreground">Order Summary</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {rows.map(({ line, product }) => (
              <li key={`${line.productId}-${line.size}`} className="flex justify-between text-xs text-foreground-muted">
                <span>{product.name} × {line.qty} ({line.size})</span>
                <span>{formatNaira(product.price * line.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base text-foreground">
            <span>Total</span>
            <span>{formatNaira(subtotal)}</span>
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full">
            Place Order
          </Button>
        </aside>
      </form>
    </div>
  );
}
