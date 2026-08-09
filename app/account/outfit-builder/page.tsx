"use client";

import { useState } from "react";
import { Shirt, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { PRODUCTS, formatNaira } from "@/lib/data/products";
import { useStyle } from "@/lib/style/style-context";

export default function OutfitBuilderPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const { savedOutfits, saveOutfit, removeOutfit } = useStyle();

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function handleSave() {
    if (selected.length === 0) return;
    saveOutfit(name.trim() || `Outfit ${savedOutfits.length + 1}`, selected);
    setSelected([]);
    setName("");
  }

  const total = selected.reduce(
    (sum, id) => sum + (PRODUCTS.find((p) => p.id === id)?.price ?? 0),
    0
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Shirt className="text-primary" aria-hidden="true" />
        <div>
          <h1 className="font-serif text-3xl text-foreground">Outfit Builder</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Mix pieces from the catalogue into a look, then save it for later.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {PRODUCTS.map((p) => {
          const active = selected.includes(p.id);
          const [from, to] = p.swatch;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              aria-pressed={active}
              aria-label={`${active ? "Remove" : "Add"} ${p.name} ${active ? "from" : "to"} outfit`}
              className={cn(
                "rounded-card border bg-surface-elevated p-3 text-left transition-colors",
                active ? "border-gold" : "border-border"
              )}
            >
              <div
                className="aspect-[4/5] rounded-[12px]"
                style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
                aria-hidden="true"
              />
              <p className="mt-2 text-xs text-foreground">{p.name}</p>
              <p className="text-xs text-foreground-muted">{formatNaira(p.price)}</p>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <Card className="sticky bottom-4 flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="text-sm text-foreground">
            {selected.length} pieces selected · {formatNaira(total)}
          </p>
          <div className="flex gap-2">
            <label htmlFor="outfit-name" className="sr-only">
              Name this outfit
            </label>
            <input
              id="outfit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name this outfit"
              className="h-10 rounded-input border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted"
            />
            <Button onClick={handleSave} size="sm">
              <Save size={14} aria-hidden="true" /> Save Outfit
            </Button>
          </div>
        </Card>
      )}

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
