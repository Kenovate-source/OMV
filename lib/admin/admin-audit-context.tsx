"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface AuditEntry {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
}

interface AdminAuditContextValue {
  entries: AuditEntry[];
  logAction: (adminName: string, action: string) => void;
}

const AdminAuditContext = createContext<AdminAuditContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-admin-audit";

export function AdminAuditProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setEntries(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, hydrated]);

  const logAction: AdminAuditContextValue["logAction"] = (adminName, action) => {
    const entry: AuditEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      adminName,
      action,
    };
    setEntries((prev) => [entry, ...prev]);
  };

  return (
    <AdminAuditContext.Provider value={{ entries, logAction }}>
      {children}
    </AdminAuditContext.Provider>
  );
}

export function useAdminAudit() {
  const ctx = useContext(AdminAuditContext);
  if (!ctx) throw new Error("useAdminAudit must be used within an AdminAuditProvider");
  return ctx;
}
