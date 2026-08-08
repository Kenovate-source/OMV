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
  size: string;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  addItem: (product: Product, size: string, qty?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  clear: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setLines(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addItem: CartContextValue["addItem"] = (product, size, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === product.id && l.size === size);
      if (existing) {
        return prev.map((l) =>
          l.productId === product.id && l.size === size ? { ...l, qty: l.qty + qty } : l
        );
      }
      return [...prev, { productId: product.id, size, qty }];
    });
  };

  const removeItem: CartContextValue["removeItem"] = (productId, size) => {
    setLines((prev) => prev.filter((l) => !(l.productId === productId && l.size === size)));
  };

  const updateQty: CartContextValue["updateQty"] = (productId, size, qty) => {
    setLines((prev) =>
      prev.map((l) =>
        l.productId === productId && l.size === size ? { ...l, qty: Math.max(1, qty) } : l
      )
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
