"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { useInventory } from "@/lib/inventory/inventory-context";
import { formatNaira, getTotalStock, type Product } from "@/lib/data/products";

export function ProductTile({ product: staticProduct }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const { getProduct } = useInventory();
  const product = getProduct(staticProduct.id) ?? staticProduct;
  const wished = has(product.id);
  const [from, to] = product.swatch;
  const outOfStock = getTotalStock(product) === 0;

  return (
    <Card className="group relative flex flex-col gap-4 p-4">
      <Link href={`/product/${product.slug}`} className="relative block">
        <div
          className={cn(
            "relative aspect-[4/5] overflow-hidden rounded-[14px] transition-transform duration-250 group-hover:scale-[1.02]",
            outOfStock && "opacity-50"
          )}
          style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
          aria-hidden="true"
        />
        {outOfStock ? (
          <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-xs font-medium tracking-wide text-foreground-muted">
            Out of Stock
          </span>
        ) : (
          product.badge && (
            <span
              className={cn(
                "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium tracking-wide",
                product.badge === "Premium"
                  ? "bg-gold text-gold-foreground"
                  : "bg-accent text-accent-foreground"
              )}
            >
              {product.badge}
            </span>
          )
        )}
      </Link>
      <button
        type="button"
        onClick={() => toggle(product.id)}
        aria-pressed={wished}
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        className="absolute right-7 top-7 flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition-colors hover:text-gold"
      >
        <Heart size={16} aria-hidden="true" fill={wished ? "currentColor" : "none"} className={wished ? "text-gold" : ""} />
      </button>
      <Link href={`/product/${product.slug}`}>
        <h3 className="font-serif text-base text-foreground">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-sm text-foreground-muted">
            {formatNaira(product.salePrice ?? product.price)}
          </p>
          {product.salePrice && (
            <p className="text-xs text-foreground-muted line-through">{formatNaira(product.price)}</p>
          )}
        </div>
      </Link>
    </Card>
  );
}
