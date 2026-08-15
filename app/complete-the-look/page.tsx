"use client";

import { useState } from "react";
import { Sparkles, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Mannequin, type MannequinOutfit } from "@/components/shop/Mannequin";
import { cn } from "@/lib/cn";
import { OCCASION_CATALOGUE, CURATED_LOOKS } from "@/lib/data/occasions";
import { PRODUCTS, formatNaira, getOutfitSlot, SLOT_LABELS } from "@/lib/data/products";
import { useCart } from "@/lib/cart/cart-context";

export default function CompleteTheLookPage() {
  const { addItem } = useCart();
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [occasion, setOccasion] = useState("Wedding Guest");
  const [added, setAdded] = useState(false);

  const category = OCCASION_CATALOGUE[categoryIndex];
  const look = CURATED_LOOKS[occasion];

  const lookItems = look
    ? Object.entries(look)
        .map(([slot, id]) => ({ slot, product: PRODUCTS.find((p) => p.id === id) }))
        .filter((x): x is { slot: string; product: (typeof PRODUCTS)[number] } => Boolean(x.product))
    : [];

  const mannequinOutfit: MannequinOutfit = Object.fromEntries(
    lookItems.map(({ product }): [string, string] => [getOutfitSlot(product), product.swatch[0]])
  );

  const total = lookItems.reduce((sum, { product }) => sum + (product.salePrice ?? product.price), 0);

  function handleAddLook() {
    lookItems.forEach(({ product }) => {
      const variant = product.variants.find((v) => v.stock > 0);
      if (variant) addItem(product, variant.color, variant.size);
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-gold">Styling</p>
      <h1 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">Complete the Look</h1>
      <p className="mt-3 max-w-2xl text-sm text-foreground-muted">
        Choose what you&apos;re dressing for — a coordinated look, visualized
        before you buy.
      </p>

      <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
        {OCCASION_CATALOGUE.map((cat, i) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => {
              setCategoryIndex(i);
              const first = cat.occasions[0];
              if (first) setOccasion(first);
            }}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs",
              i === categoryIndex
                ? "border-gold bg-gold text-gold-foreground"
                : "border-border text-foreground-muted"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {category?.occasions.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOccasion(o)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs",
              o === occasion
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground-muted hover:text-foreground"
            )}
          >
            {o}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit p-6">
          <Mannequin outfit={mannequinOutfit} size="lg" />
        </Card>

        <div>
          <h2 className="font-serif text-2xl text-foreground">{occasion}</h2>

          {lookItems.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface-elevated p-10 text-center">
              <Sparkles size={24} className="text-foreground-muted" aria-hidden="true" />
              <p className="max-w-sm text-sm text-foreground-muted">
                We haven&apos;t curated a look for {occasion} yet — the
                occasion catalogue is intentionally broader than our current
                curated looks. Try Outfit Builder to compose one yourself.
              </p>
              <a href="/account/outfit-builder" className="text-sm text-gold hover:underline">
                Open Outfit Builder →
              </a>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {lookItems.map(({ slot, product }) => {
                  const [from, to] = product.swatch;
                  return (
                    <Card key={product.id} className="p-3">
                      <div
                        className="aspect-[4/5] rounded-[12px]"
                        style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
                        aria-hidden="true"
                      />
                      <p className="mt-2 text-xs uppercase tracking-wide text-gold">
                        {SLOT_LABELS[getOutfitSlot(product)] ?? slot}
                      </p>
                      <p className="text-sm text-foreground">{product.name}</p>
                      <p className="text-xs text-foreground-muted">{formatNaira(product.salePrice ?? product.price)}</p>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between rounded-card border border-border bg-surface-elevated p-5">
                <p className="text-sm text-foreground">
                  Complete look · {formatNaira(total)}
                </p>
                <Button onClick={handleAddLook}>
                  <ShoppingBag size={16} aria-hidden="true" />
                  {added ? "Added ✓" : "Add Complete Look to Bag"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
