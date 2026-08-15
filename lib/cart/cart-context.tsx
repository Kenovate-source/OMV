"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/data/products";

export interface CartLine {
  productId: string;
  color: string;
  size: string;
  qty: number;
}

function sameLine(a: { productId: string; color: string; size: string }, b: typeof a) {
  return a.productId === b.productId && a.color === b.color && a.size === b.size;
}

interface CartContextValue {
  lines: CartLine[];
  addItem: (product: Product, color: string, size: string, qty?: number) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQty: (productId: string, color: string, size: string, qty: number) => void;
  clear: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-cart";

// Migrates Phase 2/3 cart lines (no `color` field) into the Phase 4 shape
// so a reviewer's existing cart doesn't silently break after this update.
function migrateLine(raw: unknown): CartLine | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.productId !== "string" || typeof r.size !== "string" || typeof r.qty !== "number") {
    return null;
  }
  return {
    productId: r.productId,
    color: typeof r.color === "string" ? r.color : "",
    size: r.size,
    qty: r.qty,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setLines(parsed.map(migrateLine).filter((l): l is CartLine => l !== null));
        }
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addItem: CartContextValue["addItem"] = (product, color, size, qty = 1) => {
    setLines((prev) => {
      const key = { productId: product.id, color, size };
      const existing = prev.find((l) => sameLine(l, key));
      if (existing) {
        return prev.map((l) => (sameLine(l, key) ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { ...key, qty }];
    });
  };

  const removeItem: CartContextValue["removeItem"] = (productId, color, size) => {
    const key = { productId, color, size };
    setLines((prev) => prev.filter((l) => !sameLine(l, key)));
  };

  const updateQty: CartContextValue["updateQty"] = (productId, color, size, qty) => {
    const key = { productId, color, size };
    setLines((prev) =>
      prev.map((l) => (sameLine(l, key) ? { ...l, qty: Math.max(1, qty) } : l))
    );
  };

  const clear = () => setLines([]);
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <CartContext.Provider value={{ lines, addItem, removeItem, updateQty, clear, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
