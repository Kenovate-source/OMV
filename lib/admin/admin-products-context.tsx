"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS, type Product } from "@/lib/data/products";

export interface AdminProduct extends Product {
  stock: number;
}

interface AdminProductsContextValue {
  products: AdminProduct[];
  addProduct: (p: Omit<AdminProduct, "id">) => void;
  updateProduct: (id: string, patch: Partial<AdminProduct>) => void;
  removeProduct: (id: string) => void;
}

const AdminProductsContext = createContext<AdminProductsContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-admin-products";

function seed(): AdminProduct[] {
  return PRODUCTS.map((p, i) => ({ ...p, stock: 20 + ((i * 7) % 40) }));
}

export function AdminProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setProducts(stored ? JSON.parse(stored) : seed());
    } catch {
      setProducts(seed());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products, hydrated]);

  const addProduct: AdminProductsContextValue["addProduct"] = (p) => {
    const id = `admin-${Date.now()}`;
    setProducts((prev) => [{ ...p, id }, ...prev]);
  };

  const updateProduct: AdminProductsContextValue["updateProduct"] = (id, patch) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removeProduct = (id: string) =>
    setProducts((prev) => prev.filter((p) => p.id !== id));

  return (
    <AdminProductsContext.Provider
      value={{ products, addProduct, updateProduct, removeProduct }}
    >
      {children}
    </AdminProductsContext.Provider>
  );
}

export function useAdminProducts() {
  const ctx = useContext(AdminProductsContext);
  if (!ctx) throw new Error("useAdminProducts must be used within an AdminProductsProvider");
  return ctx;
}
