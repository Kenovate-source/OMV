"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpend: number;
  status: "Active" | "Blocked";
}

const SEED: AdminCustomer[] = [
  { id: "c1", name: "Amaka Johnson", email: "amaka@example.com", orders: 4, totalSpend: 210000, status: "Active" },
  { id: "c2", name: "David Okafor", email: "david@example.com", orders: 2, totalSpend: 95000, status: "Active" },
  { id: "c3", name: "Grace Ibe", email: "grace@example.com", orders: 7, totalSpend: 430000, status: "Active" },
  { id: "c4", name: "Samuel Eze", email: "samuel@example.com", orders: 1, totalSpend: 34000, status: "Blocked" },
  { id: "c5", name: "Bisi Adewale", email: "bisi@example.com", orders: 3, totalSpend: 128000, status: "Active" },
];

interface AdminCustomersContextValue {
  customers: AdminCustomer[];
  toggleStatus: (id: string) => void;
}

const AdminCustomersContext = createContext<AdminCustomersContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-admin-customers";

export function AdminCustomersProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setCustomers(stored ? JSON.parse(stored) : SEED);
    } catch {
      setCustomers(SEED);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  }, [customers, hydrated]);

  const toggleStatus = (id: string) =>
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "Active" ? "Blocked" : "Active" } : c
      )
    );

  return (
    <AdminCustomersContext.Provider value={{ customers, toggleStatus }}>
      {children}
    </AdminCustomersContext.Provider>
  );
}

export function useAdminCustomers() {
  const ctx = useContext(AdminCustomersContext);
  if (!ctx) throw new Error("useAdminCustomers must be used within an AdminCustomersProvider");
  return ctx;
}
