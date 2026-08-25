"use client";

import { useMemo, useState } from "react";
import { Shirt, Save, Trash2, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Mannequin, type MannequinOutfit } from "@/components/shop/Mannequin";
import { cn } from "@/lib/cn";
import {
  PRODUCTS,
  formatNaira,
  getOutfitSlot,
  getColors,
  getSizes,
  SLOT_LABELS,
  type OutfitSlot,
  type Product,
} from "@/lib/data/products";
import { useStyle } from "@/lib/style/style-context";
import { useCart } from "@/lib/cart/cart-context";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { useInventory } from "@/lib/inventory/inventory-context";

const SLOT_ORDER: OutfitSlot[] = [
  "dress", "traditionalWear", "top", "shirt", "jacket", "trousers", "skirt",
  "shoes", "bag", "headwear", "accessory",
];

export default function OutfitBuilderPage() {
  const { preferences, savedOutfits, saveOutfit, removeOutfit } = useStyle();
  const { addItem } = useCart();
  const { toggle: toggleWishlist, has: inWishlist } = useWishlist();
  const { getProduct } = useInventory();
  const [selected, setSelected] = useState<Partial<Record<OutfitSlot, string>>>({});
  const [sizes, setSizes] = useState<Partial<Record<OutfitSlot, string>>>({});
  const [name, setName] = useState("");

  const bySlot = useMemo(() => {
    const map: Record<OutfitSlot, Product[]> = {
      dress: [], top: [], shirt: [], jacket: [], trousers: [], skirt: [],
      traditionalWear: [], shoes: [], bag: [], headwear: [], accessory: [],
    };
    PRODUCTS.forEach((p) => map[getOutfitSlot(p)].push(p));
    return map;
  }, []);

  function isRecommended(p: Product) {
    const colorMatch = preferences.favoriteColors.some((c) =>
      p.name.toLowerCase().includes(c.toLowerCase())
    );
    const styleMatch = preferences.favoriteStyles.length > 0 && p.badge === "Premium"
      ? preferences.favoriteStyles.includes("Elegant")
      : false;
    return colorMatch || styleMatch;
  }

  function selectForSlot(slot: OutfitSlot, productId: string) {
    setSelected((prev) => {
      const next = { ...prev, [slot]: prev[slot] === productId ? undefined : productId };
      return next;
    });
    setSizes((prev) => {
      if (selected[slot] === productId) {
        // Deselecting — clear the size too, nothing is chosen for this slot.
        const next = { ...prev };
        delete next[slot];
        return next;
      }
      // Selecting — default to the first available size so a size is
      // always part of the state the moment a garment is chosen, per the
      // requirement that "the selected size must be clearly associated
      // with the garment and carried through to the outfit/bag selection."
      const product = PRODUCTS.find((p) => p.id === productId);
      const firstSize = product ? getSizes(product)[0] : undefined;
      return { ...prev, [slot]: firstSize ?? "" };
    });
  }

  function chooseSize(slot: OutfitSlot, size: string) {
    setSizes((prev) => ({ ...prev, [slot]: size }));
  }

  const selectedProducts = Object.entries(selected)
    .filter((entry): entry is [OutfitSlot, string] => Boolean(entry[1]))
    .map(([slot, id]) => ({ slot, product: getProduct(id) }))
    .filter((x): x is { slot: OutfitSlot; product: Product } => Boolean(x.product));

  const mannequinOutfit: MannequinOutfit = Object.fromEntries(
    selectedProducts.map(({ slot, product }): [string, string] => [slot, product.swatch[0]])
  );

  const total = selectedProducts.reduce(
    (sum, { product }) => sum + (product.salePrice ?? product.price),
    0
  );

  function handleSave() {
    if (selectedProducts.length === 0) return;
    saveOutfit(
      name.trim() || `Outfit ${savedOutfits.length + 1}`,
      selectedProducts.map((s) => s.product.id)
    );
    setName("");
  }

  function handleAddOutfitToBag() {
    selectedProducts.forEach(({ slot, product }) => {
      const chosenSize = sizes[slot];
      const firstColor = getColors(product)[0];
      // Prefer the exact colour+size the customer chose in the builder;
      // fall back to any in-stock variant only if that precise combination
      // isn't available, so a chosen size is respected whenever possible.
      const exact = chosenSize && firstColor
        ? product.variants.find((v) => v.color === firstColor && v.size === chosenSize && v.stock > 0)
        : undefined;
      const variant = exact ?? product.variants.find((v) => v.stock > 0);
      if (variant) addItem(product, variant.color, variant.size);
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Shirt className="text-primary" aria-hidden="true" />
        <div>
          <h1 className="font-serif text-3xl text-foreground">Outfit Builder</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Build a look piece by piece and preview it on the mannequin.
            {preferences.favoriteColors.length > 0 &&
              " Items matching your Style Quiz preferences are marked Recommended."}
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <Card className="p-6">
            <Mannequin outfit={mannequinOutfit} size="md" />
          </Card>
          {selectedProducts.length > 0 && (
            <Card className="mt-4 flex flex-col gap-3 p-4">
              <p className="text-sm text-foreground">
                {selectedProducts.length} pieces · {formatNaira(total)}
              </p>
              <ul className="flex flex-col gap-1">
                {selectedProducts.map(({ slot, product }) => (
                  <li key={slot} className="text-xs text-foreground-muted">
                    {SLOT_LABELS[slot]}: {product.name}
                    {sizes[slot] ? ` (Size ${sizes[slot]})` : ""}
                  </li>
                ))}
              </ul>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name this outfit"
                className="h-10 rounded-input border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted"
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" className="flex-1">
                  <Save size={14} aria-hidden="true" /> Save
                </Button>
                <Button onClick={handleAddOutfitToBag} size="sm" variant="outline" className="flex-1">
                  <ShoppingBag size={14} aria-hidden="true" /> Add Look
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-10">
          {SLOT_ORDER.filter((slot) => bySlot[slot].length > 0).map((slot) => (
            <div key={slot}>
              <h2 className="mb-4 font-serif text-lg text-foreground">{SLOT_LABELS[slot]}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {bySlot[slot].map((p) => {
                  const active = selected[slot] === p.id;
                  const [from, to] = p.swatch;
                  return (
                    <div key={p.id} className="relative">
                      <button
                        type="button"
                        onClick={() => selectForSlot(slot, p.id)}
                        aria-pressed={active}
                        aria-label={`${active ? "Remove" : "Select"} ${p.name} for ${SLOT_LABELS[slot]}`}
                        className={cn(
                          "w-full rounded-card border bg-surface-elevated p-3 text-left transition-colors",
                          active ? "border-gold" : "border-border"
                        )}
                      >
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[12px]">
                          <div
                            className="h-full w-full"
                            style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
                            aria-hidden="true"
                          />
                          {isRecommended(p) && (
                            <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-medium text-gold-foreground">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-foreground">{p.name}</p>
                        <p className="text-xs text-foreground-muted">{formatNaira(p.salePrice ?? p.price)}</p>
                      </button>
                      {active && getSizes(p).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Size for ${p.name}`}>
                          {getSizes(p).map((s) => (
                            <button
                              key={s}
                              type="button"
                              role="radio"
                              aria-checked={sizes[slot] === s}
                              onClick={() => chooseSize(slot, s)}
                              className={cn(
                                "rounded-full border px-2.5 py-1 text-[11px]",
                                sizes[slot] === s
                                  ? "border-gold bg-gold text-gold-foreground"
                                  : "border-border text-foreground-muted"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(p.id)}
                        aria-pressed={inWishlist(p.id)}
                        aria-label={inWishlist(p.id) ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
                        className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur"
                      >
                        <Heart size={13} aria-hidden="true" fill={inWishlist(p.id) ? "currentColor" : "none"} className={inWishlist(p.id) ? "text-gold" : ""} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {bySlot.shoes.length === 0 && (
            <p className="text-xs text-foreground-muted">
              Shoes aren&apos;t in the catalogue yet — the Shoes slot will
              appear here once footwear products are added.
            </p>
          )}
        </div>
      </div>

      {savedOutfits.length > 0 && (
        <div>
          <h2 className="mb-4 font-serif text-lg text-foreground">Saved Outfits</h2>
          <ul className="flex flex-col gap-4">
            {savedOutfits.map((o) => (
              <li key={o.id}>
                <Card className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-serif text-base text-foreground">{o.name}</p>
                    <p className="text-xs text-foreground-muted">{o.productIds.length} pieces</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOutfit(o.id)}
                    aria-label={`Remove ${o.name}`}
                    className="text-foreground-muted hover:text-red-400"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
