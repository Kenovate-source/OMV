"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/cart/cart-context";
import { useOrders } from "@/lib/orders/order-context";
import { useInventory, type StockLineRequest } from "@/lib/inventory/inventory-context";
import { formatNaira } from "@/lib/data/products";

export default function CheckoutPage() {
  const { lines, clear } = useCart();
  const { addOrder } = useOrders();
  const { getProduct, checkStock, deductStock } = useInventory();
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [stockError, setStockError] = useState<string | null>(null);

  const rows = lines
    .map((line) => ({ line, product: getProduct(line.productId) }))
    .filter((r): r is { line: typeof lines[number]; product: NonNullable<typeof r.product> } => Boolean(r.product));
  const subtotal = rows.reduce(
    (sum, r) => sum + (r.product.salePrice ?? r.product.price) * r.line.qty,
    0
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStockError(null);

    // Re-validate against LIVE stock at the moment of order creation, not
    // whatever the cart last knew — someone else (in another tab, or via
    // the admin portal) may have changed stock since the item was added.
    // This is the "do not allow purchasing more than available" check.
    const stockLines: StockLineRequest[] = rows.map((r) => ({
      productId: r.line.productId,
      color: r.line.color,
      size: r.line.size,
      qty: r.line.qty,
    }));
    const result = checkStock(stockLines);
    if (!result.ok && result.failedLine) {
      const failedRow = rows.find(
        (r) =>
          r.line.productId === result.failedLine!.productId &&
          r.line.color === result.failedLine!.color &&
          r.line.size === result.failedLine!.size
      );
      const name = failedRow?.product.name ?? "An item";
      setStockError(
        result.failedLine.available === 0
          ? `${name} (${result.failedLine.color}, ${result.failedLine.size}) just sold out. Please remove it from your bag.`
          : `Only ${result.failedLine.available} left of ${name} (${result.failedLine.color}, ${result.failedLine.size}) — please lower the quantity in your bag.`
      );
      return;
    }

    // Deduct stock and record the order together. NOTE: in this Phase 4
    // client-side implementation these are two separate local-state writes,
    // not one atomic transaction — fine for a single-browser demo, but if
    // two customers could check out from the same stock simultaneously
    // (which they can't here, since each browser has its own local
    // inventory copy), this exact sequence could oversell. Phase 5 MUST
    // perform the check-and-deduct as a single atomic database transaction
    // server-side to make this safe with real concurrent traffic.
    deductStock(stockLines);

    const id = `OMV-${Date.now().toString().slice(-8)}`;
    addOrder({
      id,
      date: new Date().toISOString(),
      total: subtotal,
      items: rows.map((r) => ({
        productId: r.product.id,
        name: r.product.name,
        color: r.line.color,
        size: r.line.size,
        qty: r.line.qty,
        price: r.product.salePrice ?? r.product.price,
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
              <li key={`${line.productId}-${line.color}-${line.size}`} className="flex justify-between text-xs text-foreground-muted">
                <span>{product.name} × {line.qty} ({line.color}, {line.size})</span>
                <span>{formatNaira((product.salePrice ?? product.price) * line.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base text-foreground">
            <span>Total</span>
            <span>{formatNaira(subtotal)}</span>
          </div>

          {stockError && (
            <div className="mt-4 flex items-start gap-2 rounded-input border border-red-400/40 bg-red-400/10 p-3 text-xs text-red-400">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>{stockError}</p>
            </div>
          )}

          <Button type="submit" size="lg" className="mt-6 w-full">
            Place Order
          </Button>
        </aside>
      </form>
    </div>
  );
}
