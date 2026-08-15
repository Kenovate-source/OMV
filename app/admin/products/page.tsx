"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Shirt, Trash2, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RequireRole } from "@/components/admin/RequireRole";
import { useInventory } from "@/lib/inventory/inventory-context";
import { useAdminAudit } from "@/lib/admin/admin-audit-context";
import { useAdminAuth } from "@/lib/admin/admin-auth-context";
import { formatNaira, getTotalStock, type Category, type ProductStatus } from "@/lib/data/products";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminProductsPage() {
  const { products, addProduct, removeProduct } = useInventory();
  const { logAction } = useAdminAudit();
  const { currentAdmin } = useAdminAuth();
  const [category, setCategory] = useState<Category>("women");
  const [status, setStatus] = useState<ProductStatus>("Active");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const price = Number(fd.get("price") ?? 0);
    const salePriceRaw = String(fd.get("salePrice") ?? "").trim();
    const subcategory = String(fd.get("subcategory") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    const colors = String(fd.get("colors") ?? "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const sizes = String(fd.get("sizes") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const defaultStock = Number(fd.get("defaultStock") ?? 0);
    if (!name || !price || colors.length === 0 || sizes.length === 0) return;

    const variants = colors.flatMap((color) =>
      sizes.map((size) => ({ color, size, stock: Math.max(0, defaultStock) }))
    );

    addProduct({
      slug: slugify(name),
      name,
      category,
      subcategory: subcategory || undefined,
      price,
      salePrice: salePriceRaw ? Number(salePriceRaw) : undefined,
      status,
      description,
      variants,
      swatch: ["#12372A", "#1B4332"],
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
              Full catalogue management — this is the same live inventory
              the storefront, cart and checkout read from.
            </p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="flex flex-col gap-4">
            {products.map((p) => (
              <li key={p.id}>
                <Card className="flex items-center justify-between gap-4 p-4">
                  <Link href={`/admin/products/${p.id}`} className="flex-1">
                    <p className="font-serif text-base text-foreground">{p.name}</p>
                    <p className="mt-1 flex flex-wrap gap-x-2 text-xs capitalize text-foreground-muted">
                      <span>{p.category}{p.subcategory ? ` · ${p.subcategory}` : ""}</span>
                      <span>· {formatNaira(p.salePrice ?? p.price)}</span>
                      <span>· {getTotalStock(p)} in stock</span>
                      <span>· {p.variants.length} variants</span>
                      <span
                        className={
                          p.status === "Active"
                            ? "text-primary"
                            : p.status === "Draft"
                            ? "text-gold"
                            : "text-foreground-muted"
                        }
                      >
                        · {p.status}
                      </span>
                    </p>
                  </Link>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleRemove(p.id, p.name)}
                      aria-label={`Remove ${p.name}`}
                      className="text-foreground-muted hover:text-red-400"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                    <Link href={`/admin/products/${p.id}`} aria-label={`Edit ${p.name}`}>
                      <ChevronRight size={18} className="text-foreground-muted" aria-hidden="true" />
                    </Link>
                  </div>
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
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full rounded-input border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted"
                  placeholder="Fabric, fit, styling notes…"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                <Input label="Subcategory" name="subcategory" placeholder="e.g. Dresses" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Price (₦)" name="price" type="number" min="0" required />
                <Input label="Sale price (₦)" name="salePrice" type="number" min="0" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  className="h-11 w-full rounded-input border border-border bg-surface px-4 text-sm text-foreground"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <Input label="Colours (comma separated)" name="colors" placeholder="Emerald, Midnight" required />
              <Input label="Sizes (comma separated)" name="sizes" placeholder="S, M, L" required />
              <Input
                label="Starting stock per variant"
                name="defaultStock"
                type="number"
                min="0"
                defaultValue="10"
                hint="You can fine-tune stock per colour/size after creating the product."
              />
              <Button type="submit">Add Product</Button>
            </div>
          </form>
        </div>
      </div>
    </RequireRole>
  );
}
