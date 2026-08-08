"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductTile } from "@/components/shop/ProductTile";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/cart/cart-context";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { formatNaira, getRelatedProducts, type Product } from "@/lib/data/products";

export function ProductDetail({ product }: { product: Product }) {
  // product.sizes[0] is `string | undefined` under noUncheckedIndexedAccess
  // (tsconfig strict mode), so the state itself is typed as the guaranteed
  // `string` it should be, with an explicit fallback for the edge case of
  // a product with no sizes defined at all.
  const [size, setSize] = useState<string>(product.sizes[0] ?? "");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const [from, to] = product.swatch;
  const relatedProducts = getRelatedProducts(product.completeTheLook);
  const hasSizeSelected = size.length > 0;

  function handleAddToCart() {
    if (!hasSizeSelected) return;
    addItem(product, size);
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
          <p className="mt-3 text-xl text-gold">{formatNaira(product.price)}</p>
          <p className="mt-6 text-sm leading-relaxed text-foreground-muted">
            {product.description}
          </p>

          <div className="mt-8">
            <h2 className="mb-3 text-sm font-medium text-foreground">
              {hasSizeSelected ? `Size — ${size}` : "Select a size"}
            </h2>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select size">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={size === s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "h-11 min-w-11 rounded-input border px-3 text-sm transition-colors",
                    size === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:border-gold"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-3 text-sm font-medium text-foreground">Colours</h2>
            <p className="text-sm text-foreground-muted">{product.colors.join(" · ")}</p>
          </div>

          <div className="mt-10 flex gap-3">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!hasSizeSelected}
              className="flex-1"
            >
              {added ? "Added to bag ✓" : "Add to Bag"}
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

import { ProductTile } from "@/components/shop/ProductTile";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/cart/cart-context";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { formatNaira, getRelatedProducts, type Product } from "@/lib/data/products";

export function ProductDetail({ product }: { product: Product }) {
  // product.sizes[0] is `string | undefined` under noUncheckedIndexedAccess
  // (tsconfig strict mode), so the state itself is typed as the guaranteed
  // `string` it should be, with an explicit fallback for the edge case of
  // a product with no sizes defined at all.
  const [size, setSize] = useState<string>(product.sizes[0] ?? "");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const [from, to] = product.swatch;
  const relatedProducts = getRelatedProducts(product.completeTheLook);
  const hasSizeSelected = size.length > 0;

  function handleAddToCart() {
    if (!hasSizeSelected) return;
    addItem(product, size);
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
          <p className="mt-3 text-xl text-gold">{formatNaira(product.price)}</p>
          <p className="mt-6 text-sm leading-relaxed text-foreground-muted">
            {product.description}
          </p>

          <div className="mt-8">
            <h2 className="mb-3 text-sm font-medium text-foreground">
              {hasSizeSelected ? `Size — ${size}` : "Select a size"}
            </h2>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select size">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={size === s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "h-11 min-w-11 rounded-input border px-3 text-sm transition-colors",
                    size === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:border-gold"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-3 text-sm font-medium text-foreground">Colours</h2>
            <p className="text-sm text-foreground-muted">{product.colors.join(" · ")}</p>
          </div>

          <div className="mt-10 flex gap-3">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!hasSizeSelected}
              className="flex-1"
            >
              {added ? "Added to bag ✓" : "Add to Bag"}
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
