"use client";

import { useState, type FormEvent } from "react";
import { Shirt, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RequireRole } from "@/components/admin/RequireRole";
import { useAdminProducts } from "@/lib/admin/admin-products-context";
import { useAdminAudit } from "@/lib/admin/admin-audit-context";
import { useAdminAuth } from "@/lib/admin/admin-auth-context";
import { formatNaira, type Category } from "@/lib/data/products";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminProductsPage() {
  const { products, addProduct, removeProduct } = useAdminProducts();
  const { logAction } = useAdminAudit();
  const { currentAdmin } = useAdminAuth();
  const [category, setCategory] = useState<Category>("women");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const price = Number(fd.get("price") ?? 0);
    const stock = Number(fd.get("stock") ?? 0);
    if (!name || !price) return;
    addProduct({
      slug: slugify(name),
      name,
      category,
      price,
      stock,
      colors: [],
      sizes: ["One Size"],
      swatch: ["#12372A", "#1B4332"],
      description: "",
    });
    if (currentAdmin) logAction(currentAdmin.name, `Added product "${name}"`);
    e.currentTarget.reset();
  }

  function handleRemove(id: string, name: string) {
    removeProduct(id);
    if (currentAdmin) logAction(currentAdmin.name, `Removed product "${name}"`);
  }

  return (
    <RequireRole roles={["super", "business"]}>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <Shirt className="text-primary" aria-hidden="true" />
          <div>
            <h1 className="font-serif text-3xl text-foreground">Products</h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Manage the admin-side catalogue. Changes here are separate from
              the live storefront until Phase 5&apos;s real inventory sync.
            </p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <ul className="flex flex-col gap-4">
            {products.map((p) => (
              <li key={p.id}>
                <Card className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-serif text-base text-foreground">{p.name}</p>
                    <p className="text-xs capitalize text-foreground-muted">
                      {p.category} · {formatNaira(p.price)} · {p.stock} in stock
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(p.id, p.name)}
                    aria-label={`Remove ${p.name}`}
                    className="text-foreground-muted hover:text-red-400"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </Card>
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-card border border-border bg-surface-elevated p-6"
          >
            <h2 className="mb-4 font-serif text-lg text-foreground">Add product</h2>
            <div className="flex flex-col gap-4">
              <Input label="Name" name="name" required />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="h-11 w-full rounded-input border border-border bg-surface px-4 text-sm text-foreground"
                >
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="kids">Kids</option>
                </select>
              </div>
              <Input label="Price (₦)" name="price" type="number" min="0" required />
              <Input label="Initial stock" name="stock" type="number" min="0" defaultValue="20" required />
              <Button type="submit">Add Product</Button>
            </div>
          </form>
        </div>
      </div>
    </RequireRole>
  );
}
