"use client";

import { useMemo, useState } from "react";
import { FilterSidebar, type Filters } from "./FilterSidebar";
import { ProductTile } from "./ProductTile";
import { getSizes, type Product } from "@/lib/data/products";

export function CatalogueView({
  title,
  description,
  products,
}: {
  title: string;
  description: string;
  products: Product[];
}) {
  const [filters, setFilters] = useState<Filters>({
    badge: null,
    size: null,
    sort: "featured",
  });

  const availableSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => getSizes(p)))).slice(0, 8),
    [products]
  );

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (filters.badge && p.badge !== filters.badge) return false;
      if (filters.size && !getSizes(p).includes(filters.size)) return false;
      return true;
    });
    if (filters.sort === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    if (filters.sort === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [products, filters]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12 max-w-2xl">
        <h1 className="font-serif text-3xl text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-foreground-muted">{description}</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <FilterSidebar filters={filters} onChange={setFilters} availableSizes={availableSizes} />

        <div>
          <p className="mb-6 text-xs text-foreground-muted">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </p>
          {filtered.length === 0 ? (
            <p className="rounded-card border border-border bg-surface-elevated p-8 text-center text-sm text-foreground-muted">
              No items match those filters yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {filtered.map((product) => (
                <ProductTile key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
