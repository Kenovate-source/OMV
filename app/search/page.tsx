"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductTile } from "@/components/shop/ProductTile";
import { searchProducts } from "@/lib/data/products";

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const results = searchProducts(q);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-serif text-3xl text-foreground">
        {q ? `Results for "${q}"` : "Search"}
      </h1>
      <p className="mt-2 text-sm text-foreground-muted">
        {results.length} {results.length === 1 ? "item" : "items"} found
      </p>

      {results.length === 0 ? (
        <p className="mt-10 rounded-card border border-border bg-surface-elevated p-8 text-center text-sm text-foreground-muted">
          Nothing matched that search. Try a category, colour or product name.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
            <ProductTile key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
