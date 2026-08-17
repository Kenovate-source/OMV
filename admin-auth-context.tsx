"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type AdminRole = "super" | "business" | "staff";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

// Master Development Guide: "support five administrators initially... the
// system should allow unlimited administrators in the future." This seed
// stands in for that until Phase 5's real multi-admin auth/RBAC backend.
export const ADMIN_SEED: AdminUser[] = [
  { id: "a1", name: "Ngozi Adeyemi", email: "ngozi@omv.africa", role: "super" },
  { id: "a2", name: "Tunde Bakare", email: "tunde@omv.africa", role: "business" },
  { id: "a3", name: "Chiamaka Obi", email: "chiamaka@omv.africa", role: "business" },
  { id: "a4", name: "Femi Alabi", email: "femi@omv.africa", role: "staff" },
  { id: "a5", name: "Blessing Eze", email: "blessing@omv.africa", role: "staff" },
];

interface AdminAuthContextValue {
  currentAdmin: AdminUser | null;
  signInAs: (adminId: string) => void;
  signOut: () => void;
  can: (roles: AdminRole[]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-admin-session";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const id = JSON.parse(stored) as string;
        setCurrentAdmin(ADMIN_SEED.find((a) => a.id === id) ?? null);
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (currentAdmin) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentAdmin.id));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentAdmin, hydrated]);

  const signInAs = (adminId: string) =>
    setCurrentAdmin(ADMIN_SEED.find((a) => a.id === adminId) ?? null);

  const signOut = () => setCurrentAdmin(null);

  const can = (roles: AdminRole[]) => !!currentAdmin && roles.includes(currentAdmin.role);

  return (
    <AdminAuthContext.Provider value={{ currentAdmin, signInAs, signOut, can }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}
