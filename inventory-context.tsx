"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS, type Product, type ProductVariant } from "@/lib/data/products";

export interface StockLineRequest {
  productId: string;
  color: string;
  size: string;
  qty: number;
}

export interface StockCheckResult {
  ok: boolean;
  /** Present when ok is false: the first line that failed validation. */
  failedLine?: StockLineRequest & { available: number };
}

interface InventoryContextValue {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
  getVariant: (productId: string, color: string, size: string) => ProductVariant | undefined;
  addProduct: (p: Omit<Product, "id">) => string;
  updateProduct: (id: string, patch: Partial<Omit<Product, "id" | "variants">>) => void;
  updateVariants: (id: string, variants: ProductVariant[]) => void;
  updateVariantStock: (productId: string, color: string, size: string, stock: number) => void;
  removeProduct: (id: string) => void;
  /** Checks every line against live stock without mutating anything —
   * this is what checkout calls before allowing an order to complete. */
  checkStock: (lines: StockLineRequest[]) => StockCheckResult;
  /** Deducts stock for every line. Only call after checkStock() passes —
   * this itself does not re-validate, matching how a real backend would
   * separate "validate" from "commit" inside one transaction (Phase 5:
   * this whole read-check-write must become a single atomic DB
   * transaction to prevent overselling between concurrent customers;
   * client-side local state cannot guarantee that). */
  deductStock: (lines: StockLineRequest[]) => void;
  /** Reverses a prior deduction — used when an admin cancels/refunds an
   * order. Phase 5's real rules may add conditions (e.g. only within a
   * return window); this is the mechanical restore only. */
  restoreStock: (lines: StockLineRequest[]) => void;
}

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-inventory";

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setProducts(stored ? JSON.parse(stored) : PRODUCTS);
    } catch {
      setProducts(PRODUCTS);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products, hydrated]);

  const getProduct = (id: string) => products.find((p) => p.id === id);

  const getVariant = (productId: string, color: string, size: string) =>
    getProduct(productId)?.variants.find((v) => v.color === color && v.size === size);

  const addProduct: InventoryContextValue["addProduct"] = (p) => {
    const id = `admin-${Date.now()}`;
    setProducts((prev) => [{ ...p, id }, ...prev]);
    return id;
  };

  const updateProduct: InventoryContextValue["updateProduct"] = (id, patch) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const updateVariants: InventoryContextValue["updateVariants"] = (id, variants) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, variants } : p)));
  };

  const updateVariantStock: InventoryContextValue["updateVariantStock"] = (
    productId,
    color,
    size,
    stock
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : {
              ...p,
              variants: p.variants.map((v) =>
                v.color === color && v.size === size ? { ...v, stock: Math.max(0, stock) } : v
              ),
            }
      )
    );
  };

  const removeProduct = (id: string) =>
    setProducts((prev) => prev.filter((p) => p.id !== id));

  const checkStock: InventoryContextValue["checkStock"] = (lines) => {
    for (const line of lines) {
      const variant = getVariant(line.productId, line.color, line.size);
      const available = variant?.stock ?? 0;
      if (available < line.qty) {
        return { ok: false, failedLine: { ...line, available } };
      }
    }
    return { ok: true };
  };

  // Applies every line's delta in one state update so concurrent React
  // batching can't apply some lines and drop others.
  function applyDelta(lines: StockLineRequest[], sign: 1 | -1) {
    setProducts((prev) =>
      prev.map((p) => {
        const relevant = lines.filter((l) => l.productId === p.id);
        if (relevant.length === 0) return p;
        return {
          ...p,
          variants: p.variants.map((v) => {
            const match = relevant.find((l) => l.color === v.color && l.size === v.size);
            if (!match) return v;
            return { ...v, stock: Math.max(0, v.stock + sign * match.qty) };
          }),
        };
      })
    );
  }

  const deductStock: InventoryContextValue["deductStock"] = (lines) => applyDelta(lines, -1);
  const restoreStock: InventoryContextValue["restoreStock"] = (lines) => applyDelta(lines, 1);

  return (
    <InventoryContext.Provider
      value={{
        products,
        getProduct,
        getVariant,
        addProduct,
        updateProduct,
        updateVariants,
        updateVariantStock,
        removeProduct,
        checkStock,
        deductStock,
        restoreStock,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within an InventoryProvider");
  return ctx;
}
