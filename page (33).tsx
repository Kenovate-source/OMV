"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductTile } from "@/components/shop/ProductTile";
import { buttonVariants } from "@/components/ui/Button";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { PRODUCTS } from "@/lib/data/products";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const items = PRODUCTS.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-serif text-3xl text-foreground">Your Wishlist</h1>
      <p className="mt-2 text-sm text-foreground-muted">
        {items.length} saved {items.length === 1 ? "item" : "items"}
      </p>

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-card border border-border bg-surface-elevated p-16 text-center">
          <Heart size={32} className="text-foreground-muted" aria-hidden="true" />
          <p className="text-sm text-foreground-muted">
            Nothing saved yet. Tap the heart on any item to add it here.
          </p>
          <Link href="/women" className={buttonVariants({ variant: "primary" })}>
            Browse the Collection
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductTile key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
