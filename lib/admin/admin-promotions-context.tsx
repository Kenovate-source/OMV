"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface Promotion {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
}

const SEED: Promotion[] = [
  { id: "p1", code: "WELCOME10", discountPercent: 10, active: true },
  { id: "p2", code: "FAMILY15", discountPercent: 15, active: true },
  { id: "p3", code: "GOLD20", discountPercent: 20, active: false },
];

interface AdminPromotionsContextValue {
  promotions: Promotion[];
  addPromotion: (code: string, discountPercent: number) => void;
  toggleActive: (id: string) => void;
  removePromotion: (id: string) => void;
}

const AdminPromotionsContext = createContext<AdminPromotionsContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-admin-promotions";

export function AdminPromotionsProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setPromotions(stored ? JSON.parse(stored) : SEED);
    } catch {
      setPromotions(SEED);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(promotions));
  }, [promotions, hydrated]);

  const addPromotion = (code: string, discountPercent: number) => {
    const id = `promo-${Date.now()}`;
    setPromotions((prev) => [
      { id, code: code.toUpperCase(), discountPercent, active: true },
      ...prev,
    ]);
  };

  const toggleActive = (id: string) =>
    setPromotions((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));

  const removePromotion = (id: string) =>
    setPromotions((prev) => prev.filter((p) => p.id !== id));

  return (
    <AdminPromotionsContext.Provider
      value={{ promotions, addPromotion, toggleActive, removePromotion }}
    >
      {children}
    </AdminPromotionsContext.Provider>
  );
}

export function useAdminPromotions() {
  const ctx = useContext(AdminPromotionsContext);
  if (!ctx) throw new Error("useAdminPromotions must be used within an AdminPromotionsProvider");
  return ctx;
}
