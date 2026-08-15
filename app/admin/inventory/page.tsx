"use client";

import { useState } from "react";
import { Boxes, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useInventory } from "@/lib/inventory/inventory-context";
import { useAdminAudit } from "@/lib/admin/admin-audit-context";
import { useAdminAuth } from "@/lib/admin/admin-auth-context";
import { formatNaira } from "@/lib/data/products";

const LOW_STOCK_THRESHOLD = 5;

export default function InventoryPage() {
  const { products, updateVariantStock } = useInventory();
  const { logAction } = useAdminAudit();
  const { currentAdmin } = useAdminAuth();
  const [query, setQuery] = useState("");

  function adjustStock(
    productId: string,
    productName: string,
    color: string,
    size: string,
    delta: number,
    current: number
  ) {
    const next = Math.max(0, current + delta);
    updateVariantStock(productId, color, size, next);
    if (currentAdmin) {
      logAction(
        currentAdmin.name,
        `Adjusted stock for ${productName} (${color}, ${size}) to ${next}`
      );
    }
  }

  const q = query.trim().toLowerCase();
  const visibleProducts = q
    ? products.filter((p) => p.name.toLowerCase().includes(q))
    : products;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Boxes className="text-primary" aria-hidden="true" />
        <div>
          <h1 className="font-serif text-3xl text-foreground">Inventory</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Per-variant stock — the same numbers the storefront, cart and
            checkout read live. Adjustments here take effect immediately
            everywhere.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
          aria-hidden="true"
        />
        <label htmlFor="inventory-search" className="sr-only">
          Search products
        </label>
        <input
          id="inventory-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="h-11 w-full rounded-input border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-gold"
        />
      </div>

      <div className="flex flex-col gap-6">
        {visibleProducts.map((p) => (
          <Card key={p.id} className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="font-serif text-base text-foreground">{p.name}</p>
                <p className="text-xs capitalize text-foreground-muted">
                  {p.category} · {formatNaira(p.price)}
                </p>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-foreground-muted">
                  <th className="px-5 py-3 font-normal">Colour</th>
                  <th className="px-5 py-3 font-normal">Size</th>
                  <th className="px-5 py-3 font-normal">Stock</th>
                </tr>
              </thead>
              <tbody>
                {p.variants.map((v) => (
                  <tr key={`${v.color}-${v.size}`} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-foreground">{v.color}</td>
                    <td className="px-5 py-3 text-foreground-muted">{v.size}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-label={`Decrease stock for ${p.name} ${v.color} ${v.size}`}
                          onClick={() => adjustStock(p.id, p.name, v.color, v.size, -1, v.stock)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground hover:border-gold"
                        >
                          −
                        </button>
                        <span
                          className={cn(
                            "w-10 text-center",
                            v.stock === 0
                              ? "text-red-400"
                              : v.stock < LOW_STOCK_THRESHOLD
                              ? "text-gold"
                              : "text-foreground"
                          )}
                        >
                          {v.stock}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase stock for ${p.name} ${v.color} ${v.size}`}
                          onClick={() => adjustStock(p.id, p.name, v.color, v.size, 1, v.stock)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground hover:border-gold"
                        >
                          +
                        </button>
                        {v.stock === 0 && (
                          <span className="text-xs text-red-400">Out of stock</span>
                        )}
                        {v.stock > 0 && v.stock < LOW_STOCK_THRESHOLD && (
                          <span className="text-xs text-gold">Low stock</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
    </div>
  );
}
