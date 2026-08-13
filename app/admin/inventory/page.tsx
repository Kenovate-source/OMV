"use client";

import { Boxes } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useAdminProducts } from "@/lib/admin/admin-products-context";
import { useAdminAudit } from "@/lib/admin/admin-audit-context";
import { useAdminAuth } from "@/lib/admin/admin-auth-context";
import { formatNaira } from "@/lib/data/products";

export default function InventoryPage() {
  const { products, updateProduct } = useAdminProducts();
  const { logAction } = useAdminAudit();
  const { currentAdmin } = useAdminAuth();

  function adjustStock(id: string, name: string, delta: number, current: number) {
    const next = Math.max(0, current + delta);
    updateProduct(id, { stock: next });
    if (currentAdmin) logAction(currentAdmin.name, `Adjusted stock for ${name} to ${next}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Boxes className="text-primary" aria-hidden="true" />
        <div>
          <h1 className="font-serif text-3xl text-foreground">Inventory</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Track and adjust stock levels across the catalogue.
          </p>
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-foreground-muted">
              <th className="px-5 py-4 font-normal">Product</th>
              <th className="px-5 py-4 font-normal">Category</th>
              <th className="px-5 py-4 font-normal">Price</th>
              <th className="px-5 py-4 font-normal">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-5 py-4 text-foreground">{p.name}</td>
                <td className="px-5 py-4 capitalize text-foreground-muted">{p.category}</td>
                <td className="px-5 py-4 text-foreground-muted">{formatNaira(p.price)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Decrease stock for ${p.name}`}
                      onClick={() => adjustStock(p.id, p.name, -1, p.stock)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground hover:border-gold"
                    >
                      −
                    </button>
                    <span
                      className={cn(
                        "w-10 text-center",
                        p.stock < 15 ? "text-red-400" : "text-foreground"
                      )}
                    >
                      {p.stock}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase stock for ${p.name}`}
                      onClick={() => adjustStock(p.id, p.name, 1, p.stock)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground hover:border-gold"
                    >
                      +
                    </button>
                    {p.stock < 15 && <span className="text-xs text-red-400">Low stock</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
