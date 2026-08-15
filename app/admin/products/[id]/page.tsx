"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RequireRole } from "@/components/admin/RequireRole";
import { useInventory } from "@/lib/inventory/inventory-context";
import { useAdminAudit } from "@/lib/admin/admin-audit-context";
import { useAdminAuth } from "@/lib/admin/admin-auth-context";
import {
  formatNaira,
  getColors,
  getSizes,
  type Category,
  type ProductStatus,
} from "@/lib/data/products";

export default function AdminProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getProduct, updateProduct, updateVariants, updateVariantStock } = useInventory();
  const { logAction } = useAdminAudit();
  const { currentAdmin } = useAdminAuth();
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");

  const product = getProduct(params.id);

  if (!product) {
    return (
      <RequireRole roles={["super", "business"]}>
        <div className="rounded-card border border-border bg-surface-elevated p-8 text-center text-sm text-foreground-muted">
          Product not found.{" "}
          <Link href="/admin/products" className="text-gold hover:underline">
            Back to Products
          </Link>
        </div>
      </RequireRole>
    );
  }

  const colors = getColors(product);
  const sizes = getSizes(product);

  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product) return;
    const fd = new FormData(e.currentTarget);
    updateProduct(product.id, {
      name: String(fd.get("name") ?? product.name).trim(),
      description: String(fd.get("description") ?? product.description),
      category: fd.get("category") as Category,
      subcategory: String(fd.get("subcategory") ?? "").trim() || undefined,
      price: Number(fd.get("price") ?? product.price),
      salePrice: fd.get("salePrice") ? Number(fd.get("salePrice")) : undefined,
      status: fd.get("status") as ProductStatus,
    });
    if (currentAdmin) logAction(currentAdmin.name, `Updated details for "${product.name}"`);
  }

  function addColor() {
    if (!product || !newColor.trim() || colors.includes(newColor.trim())) return;
    const additions = sizes.map((size) => ({ color: newColor.trim(), size, stock: 0 }));
    updateVariants(product.id, [...product.variants, ...additions]);
    if (currentAdmin) logAction(currentAdmin.name, `Added colour "${newColor.trim()}" to ${product.name}`);
    setNewColor("");
  }

  function addSize() {
    if (!product || !newSize.trim() || sizes.includes(newSize.trim())) return;
    const additions = colors.map((color) => ({ color, size: newSize.trim(), stock: 0 }));
    updateVariants(product.id, [...product.variants, ...additions]);
    if (currentAdmin) logAction(currentAdmin.name, `Added size "${newSize.trim()}" to ${product.name}`);
    setNewSize("");
  }

  function removeColor(color: string) {
    if (!product) return;
    updateVariants(product.id, product.variants.filter((v) => v.color !== color));
    if (currentAdmin) logAction(currentAdmin.name, `Removed colour "${color}" from ${product.name}`);
  }

  function removeSize(size: string) {
    if (!product) return;
    updateVariants(product.id, product.variants.filter((v) => v.size !== size));
    if (currentAdmin) logAction(currentAdmin.name, `Removed size "${size}" from ${product.name}`);
  }

  function setStock(color: string, size: string, stock: number) {
    if (!product) return;
    updateVariantStock(product.id, color, size, Math.max(0, stock));
  }

  return (
    <RequireRole roles={["super", "business"]}>
      <div className="flex flex-col gap-8">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="flex w-fit items-center gap-2 text-sm text-foreground-muted hover:text-gold"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to Products
        </button>

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <div
              className="aspect-[4/5] rounded-card"
              style={{ background: `linear-gradient(155deg, ${product.swatch[0]}, ${product.swatch[1]})` }}
              aria-hidden="true"
            />
            <p className="mt-4 text-xs text-foreground-muted">
              {formatNaira(product.salePrice ?? product.price)}
              {product.salePrice && (
                <span className="ml-2 line-through">{formatNaira(product.price)}</span>
              )}
              {" · "}
              {product.status}
            </p>
          </div>

          <form onSubmit={handleSave} className="rounded-card border border-border bg-surface-elevated p-6">
            <h2 className="mb-4 font-serif text-lg text-foreground">Product details</h2>
            <div className="flex flex-col gap-4">
              <Input label="Name" name="name" defaultValue={product.name} required />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={product.description}
                  className="w-full rounded-input border border-border bg-surface px-4 py-3 text-sm text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
                  <select
                    name="category"
                    defaultValue={product.category}
                    className="h-11 w-full rounded-input border border-border bg-surface px-4 text-sm text-foreground"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kids">Kids</option>
                  </select>
                </div>
                <Input label="Subcategory" name="subcategory" defaultValue={product.subcategory ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Price (₦)" name="price" type="number" min="0" defaultValue={product.price} required />
                <Input label="Sale price (₦)" name="salePrice" type="number" min="0" defaultValue={product.salePrice ?? ""} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Status</label>
                <select
                  name="status"
                  defaultValue={product.status}
                  className="h-11 w-full rounded-input border border-border bg-surface px-4 text-sm text-foreground"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <Button type="submit">Save Details</Button>
            </div>
          </form>
        </div>

        <div>
          <h2 className="mb-4 font-serif text-lg text-foreground">Colours &amp; Sizes</h2>
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <Card className="flex flex-col gap-3 p-4">
              <p className="text-xs font-medium text-foreground-muted">Colours</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <span key={c} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-foreground">
                    {c}
                    <button type="button" onClick={() => removeColor(c)} aria-label={`Remove colour ${c}`} className="text-foreground-muted hover:text-red-400">
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Add colour"
                  className="h-9 flex-1 rounded-input border border-border bg-surface px-3 text-xs text-foreground"
                />
                <button type="button" onClick={addColor} className="flex h-9 w-9 items-center justify-center rounded-input bg-primary text-primary-foreground">
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
            </Card>

            <Card className="flex flex-col gap-3 p-4">
              <p className="text-xs font-medium text-foreground-muted">Sizes</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-foreground">
                    {s}
                    <button type="button" onClick={() => removeSize(s)} aria-label={`Remove size ${s}`} className="text-foreground-muted hover:text-red-400">
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Add size"
                  className="h-9 flex-1 rounded-input border border-border bg-surface px-3 text-xs text-foreground"
                />
                <button type="button" onClick={addSize} className="flex h-9 w-9 items-center justify-center rounded-input bg-primary text-primary-foreground">
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
            </Card>
          </div>

          <h2 className="mb-4 font-serif text-lg text-foreground">Variant Stock</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {colors.map((color) => (
              <Card key={color} className="p-4">
                <p className="mb-3 font-serif text-sm text-foreground">{color}</p>
                <ul className="flex flex-col gap-2">
                  {sizes.map((size) => {
                    const variant = product.variants.find((v) => v.color === color && v.size === size);
                    const stock = variant?.stock ?? 0;
                    return (
                      <li key={size} className="flex items-center justify-between text-xs">
                        <span className="text-foreground-muted">{size}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Decrease ${color} ${size} stock`}
                            onClick={() => setStock(color, size, stock - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-foreground"
                          >
                            −
                          </button>
                          <span className={stock === 0 ? "w-6 text-center text-red-400" : "w-6 text-center text-foreground"}>
                            {stock}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${color} ${size} stock`}
                            onClick={() => setStock(color, size, stock + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-foreground"
                          >
                            +
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
