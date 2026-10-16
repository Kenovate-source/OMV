"use client";

import {
  createContext,
  useCallback,
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
// system should allow unlimited administrators in the future."
//
// Phase 5: this array is NO LONGER used to authenticate anyone — it is
// now ONLY the seed-data source of record that prisma/seed.ts reads to
// create the five AdminUser rows in the database (with real argon2id
// password hashes). Real authentication happens server-side against
// those database rows via /api/admin/auth/login. The ids here ("a1"...)
// are seed labels used for the placeholder bootstrap passwords, not
// database primary keys.
export const ADMIN_SEED: AdminUser[] = [
  { id: "a1", name: "Ngozi Adeyemi", email: "ngozi@omv.africa", role: "super" },
  { id: "a2", name: "Tunde Bakare", email: "tunde@omv.africa", role: "business" },
  { id: "a3", name: "Chiamaka Obi", email: "chiamaka@omv.africa", role: "business" },
  { id: "a4", name: "Femi Alabi", email: "femi@omv.africa", role: "staff" },
  { id: "a5", name: "Blessing Eze", email: "blessing@omv.africa", role: "staff" },
];

export interface AdminAuthResult {
  ok: boolean;
  error?: string;
}

interface AdminAuthContextValue {
  currentAdmin: AdminUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AdminAuthResult>;
  signOut: () => Promise<void>;
  /**
   * UI CONVENIENCE ONLY — decides what to render, never what is
   * permitted. The real enforcement is server-side
   * (lib/server/auth/rbac.ts's requireAdminRole, called by every
   * restricted /api/admin/** route). A caller bypassing the UI gets the
   * same 403 from the server regardless of what this returns.
   */
  can: (roles: AdminRole[]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

interface ApiAdmin {
  id: string;
  email: string;
  fullName: string;
  role: "SUPER" | "BUSINESS" | "STAFF";
}

// Maps the API's shape (fullName, UPPERCASE role) onto the AdminUser shape
// ~10 existing admin pages already depend on (name, lowercase role), so
// none of them needed to change.
function toAdminUser(a: ApiAdmin): AdminUser {
  return {
    id: a.id,
    name: a.fullName,
    email: a.email,
    role: a.role.toLowerCase() as AdminRole,
  };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth/me", { credentials: "same-origin" });
      const data = await res.json();
      setCurrentAdmin(data.admin ? toAdminUser(data.admin) : null);
    } catch {
      setCurrentAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const signIn: AdminAuthContextValue["signIn"] = async (email, password) => {
    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "same-origin",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Sign-in failed." };
    }
    setCurrentAdmin(toAdminUser(data.admin));
    return { ok: true };
  };

  const signOut = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "same-origin" });
    setCurrentAdmin(null);
  };

  const can = (roles: AdminRole[]) => !!currentAdmin && roles.includes(currentAdmin.role);

  return (
    <AdminAuthContext.Provider value={{ currentAdmin, isLoading, signIn, signOut, can }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}
