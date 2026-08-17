"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  isDefault: boolean;
}

interface AddressContextValue {
  addresses: Address[];
  addAddress: (a: Omit<Address, "id" | "isDefault">) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
}

const AddressContext = createContext<AddressContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-addresses";

export function AddressProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setAddresses(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses, hydrated]);

  const addAddress: AddressContextValue["addAddress"] = (a) => {
    const id = `${Date.now()}`;
    setAddresses((prev) => [...prev, { ...a, id, isDefault: prev.length === 0 }]);
  };

  const removeAddress = (id: string) =>
    setAddresses((prev) => prev.filter((a) => a.id !== id));

  const setDefault = (id: string) =>
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));

  return (
    <AddressContext.Provider value={{ addresses, addAddress, removeAddress, setDefault }}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses() {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddresses must be used within an AddressProvider");
  return ctx;
}
