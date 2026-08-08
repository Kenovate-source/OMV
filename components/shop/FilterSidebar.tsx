"use client";

import { cn } from "@/lib/cn";

export interface Filters {
  badge: string | null;
  size: string | null;
  sort: "featured" | "price-asc" | "price-desc";
}

const BADGES = ["New", "Family Set", "Premium"] as const;

export function FilterSidebar({
  filters,
  onChange,
  availableSizes,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  availableSizes: string[];
}) {
  return (
    <aside aria-label="Filters" className="flex flex-col gap-8">
      <div>
        <h3 className="mb-3 font-serif text-sm text-foreground">Sort by</h3>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as Filters["sort"] })}
          className="h-10 w-full rounded-input border border-border bg-surface px-3 text-sm text-foreground"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <div>
        <h3 className="mb-3 font-serif text-sm text-foreground">Collection</h3>
        <div className="flex flex-wrap gap-2">
          {BADGES.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => onChange({ ...filters, badge: filters.badge === b ? null : b })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                filters.badge === b
                  ? "border-gold bg-gold text-gold-foreground"
                  : "border-border text-foreground-muted hover:text-foreground"
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {availableSizes.length > 0 && (
        <div>
          <h3 className="mb-3 font-serif text-sm text-foreground">Size</h3>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ ...filters, size: filters.size === s ? null : s })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  filters.size === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground-muted hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {(filters.badge || filters.size || filters.sort !== "featured") && (
        <button
          type="button"
          onClick={() => onChange({ badge: null, size: null, sort: "featured" })}
          className="self-start text-xs text-gold hover:underline"
        >
          Clear all filters
        </button>
      )}
    </aside>
  );
}
