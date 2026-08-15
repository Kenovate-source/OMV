"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductTile } from "@/components/shop/ProductTile";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/cart/cart-context";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { useInventory } from "@/lib/inventory/inventory-context";
import {
  formatNaira,
  getRelatedProducts,
  getColors,
  getSizes,
  type Product,
} from "@/lib/data/products";

export function ProductDetail({ product: staticProduct }: { product: Product }) {
  // Name/description/images are static, but stock must always reflect the
  // live shared inventory (the same store Admin Inventory/Products write
  // to) — fall back to the static copy only if inventory hasn't hydrated
  // yet or the product was somehow removed.
  const { getProduct, getVariant } = useInventory();
  const product = getProduct(staticProduct.id) ?? staticProduct;

  const colors = getColors(product);
  const sizes = getSizes(product);

  // colors[0]/sizes[0] are `string | undefined` under noUncheckedIndexedAccess;
  // guarded with a literal fallback rather than reassigning from the array.
  const [color, setColor] = useState<string>(colors[0] ?? "");
  const [size, setSize] = useState<string>(sizes[0] ?? "");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const [from, to] = product.swatch;
  const relatedProducts = getRelatedProducts(product.completeTheLook);

  const selectedVariant = getVariant(product.id, color, size);
  const canAdd = Boolean(color && size && selectedVariant && selectedVariant.stock > 0);

  function handleAddToCart() {
    if (!canAdd) return;
    addItem(product, color, size);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <div
          className="aspect-[4/5] rounded-card"
          style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
          aria-hidden="true"
        />

        <div>
          {product.badge && (
            <span
              className={cn(
                "mb-4 inline-block rounded-full px-3 py-1 text-xs font-medium",
                product.badge === "Premium"
                  ? "bg-gold text-gold-foreground"
                  : "bg-accent text-accent-foreground"
              )}
            >
              {product.badge}
            </span>
          )}
          <h1 className="font-serif text-3xl text-foreground sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <p className="text-xl text-gold">
              {formatNaira(product.salePrice ?? product.price)}
            </p>
            {product.salePrice && (
              <p className="text-sm text-foreground-muted line-through">
                {formatNaira(product.price)}
              </p>
            )}
          </div>
          <p className="mt-6 text-sm leading-relaxed text-foreground-muted">
            {product.description}
          </p>

          <div className="mt-8">
            <h2 className="mb-3 text-sm font-medium text-foreground">
              {color ? `Colour — ${color}` : "Select a colour"}
            </h2>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select colour">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={color === c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-11 rounded-input border px-4 text-sm transition-colors",
                    color === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:border-gold"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-3 text-sm font-medium text-foreground">
              {size ? `Size — ${size}` : "Select a size"}
            </h2>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select size">
              {sizes.map((s) => {
                const variant = getVariant(product.id, color, s);
                const outOfStock = Boolean(color) && (!variant || variant.stock === 0);
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={size === s}
                    aria-disabled={outOfStock}
                    onClick={() => setSize(s)}
                    className={cn(
                      "relative h-11 min-w-11 rounded-input border px-3 text-sm transition-colors",
                      size === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:border-gold",
                      outOfStock && "text-foreground-muted opacity-50"
                    )}
                  >
                    {s}
                    {outOfStock && (
                      <span className="pointer-events-none absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-current" />
                    )}
                  </button>
                );
              })}
            </div>
            {color && selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
              <p className="mt-2 text-xs text-gold">Only {selectedVariant.stock} left</p>
            )}
            {color && (!selectedVariant || selectedVariant.stock === 0) && (
              <p className="mt-2 text-xs text-red-400">This colour/size combination is out of stock.</p>
            )}
          </div>

          <div className="mt-10 flex gap-3">
            <Button size="lg" onClick={handleAddToCart} disabled={!canAdd} className="flex-1">
              {added ? "Added to bag ✓" : canAdd ? "Add to Bag" : "Out of Stock"}
            </Button>
            <button
              type="button"
              onClick={() => toggle(product.id)}
              aria-pressed={wished}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-button border transition-colors",
                wished ? "border-gold text-gold" : "border-border text-foreground hover:border-gold"
              )}
            >
              <Heart size={20} aria-hidden="true" fill={wished ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-24">
          <p className="text-sm font-medium uppercase tracking-widest text-gold">
            Complete the Look
          </p>
          <h2 className="mt-3 font-serif text-2xl text-foreground">
            Pairs beautifully with
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {relatedProducts.map((p) => (
              <ProductTile key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-16">
        <Link href="/complete-the-look" className="text-sm text-gold hover:underline">
          Explore more curated pairings →
        </Link>
      </div>
    </div>
  );
}
