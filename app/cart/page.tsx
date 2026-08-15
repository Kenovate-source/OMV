"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/cart/cart-context";
import { useInventory } from "@/lib/inventory/inventory-context";
import { formatNaira } from "@/lib/data/products";

export default function CartPage() {
  const { lines, updateQty, removeItem } = useCart();
  const { getProduct, getVariant } = useInventory();

  const rows = lines
    .map((line) => ({ line, product: getProduct(line.productId) }))
    .filter((r): r is { line: typeof lines[number]; product: NonNullable<typeof r.product> } => Boolean(r.product));

  const subtotal = rows.reduce(
    (sum, r) => sum + (r.product.salePrice ?? r.product.price) * r.line.qty,
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-serif text-3xl text-foreground">Your Bag</h1>

      {rows.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-card border border-border bg-surface-elevated p-16 text-center">
          <ShoppingBag size={32} className="text-foreground-muted" aria-hidden="true" />
          <p className="text-sm text-foreground-muted">Your bag is empty.</p>
          <Link href="/women" className={buttonVariants({ variant: "primary" })}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
          <ul className="flex flex-col divide-y divide-border">
            {rows.map(({ line, product }) => {
              const [from, to] = product.swatch;
              const variant = getVariant(product.id, line.color, line.size);
              const maxStock = variant?.stock ?? 0;
              const atMax = line.qty >= maxStock;
              const price = product.salePrice ?? product.price;
              return (
                <li key={`${line.productId}-${line.color}-${line.size}`} className="flex gap-4 py-6">
                  <div
                    className="h-24 w-20 shrink-0 rounded-[12px]"
                    style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
                    aria-hidden="true"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link href={`/product/${product.slug}`} className="font-serif text-base text-foreground hover:text-gold">
                          {product.name}
                        </Link>
                        <p className="mt-1 text-xs text-foreground-muted">
                          {line.color}{line.color && line.size ? " · " : ""}{line.size ? `Size ${line.size}` : ""}
                        </p>
                      </div>
                      <p className="text-sm text-foreground">{formatNaira(price * line.qty)}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${product.name}`}
                          onClick={() => updateQty(line.productId, line.color, line.size, line.qty - 1)}
                          className="flex h-6 w-6 items-center justify-center text-foreground hover:text-gold"
                        >
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span className="w-4 text-center text-sm" aria-live="polite">{line.qty}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${product.name}`}
                          disabled={atMax}
                          onClick={() =>
                            !atMax && updateQty(line.productId, line.color, line.size, line.qty + 1)
                          }
                          className="flex h-6 w-6 items-center justify-center text-foreground hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${product.name} from bag`}
                        onClick={() => removeItem(line.productId, line.color, line.size)}
                        className="flex items-center gap-1 text-xs text-foreground-muted hover:text-red-400"
                      >
                        <Trash2 size={14} aria-hidden="true" /> Remove
                      </button>
                    </div>
                    {atMax && (
                      <p className="mt-1 text-xs text-gold">Maximum available stock reached ({maxStock}).</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit rounded-card border border-border bg-surface-elevated p-6">
            <h2 className="font-serif text-lg text-foreground">Order Summary</h2>
            <div className="mt-4 flex justify-between text-sm text-foreground-muted">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-foreground-muted">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4 text-base text-foreground">
              <span>Total</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-6 w-full")}
            >
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
