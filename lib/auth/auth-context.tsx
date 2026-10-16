"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface OMVUser {
  id: string;
  fullName: string;
  email: string;
}

interface AuthState {
  user: OMVUser | null;
  isLoading: boolean;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue extends AuthState {
  loginWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
  loginWithPhone: (phone: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
  register: (fullName: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

/**
 * Phase 5: real, server-backed authentication. The session lives in
 * httpOnly cookies set by /api/auth/* Route Handlers — this provider
 * holds no tokens and no credentials, only the non-sensitive "who is
 * logged in" display state, restored from /api/auth/me on page load
 * (cookies survive reloads; React state does not). Guest browsing
 * remains the default everywhere except where the PRD requires login.
 *
 * The exported hook shape (user, isLoading, loginWithEmail,
 * loginWithPhone, register, logout) is unchanged from Phase 1's stub so
 * no consuming component needed to change; the functions now return an
 * AuthResult so pages can show a real error instead of the stub's
 * never-fails behavior.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isLoading: true });

  const restoreSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      const data = await res.json();
      setState({ user: data.user ?? null, isLoading: false });
    } catch {
      setState({ user: null, isLoading: false });
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const loginWithEmail: AuthContextValue["loginWithEmail"] = async (email, password) => {
    setState((s) => ({ ...s, isLoading: true }));
    const { res, data } = await postJson("/api/auth/login", { email, password });
    if (!res.ok) {
      setState((s) => ({ ...s, isLoading: false }));
      return { ok: false, error: data.error ?? "Sign-in failed." };
    }
    setState({ user: data.user, isLoading: false });
    return { ok: true };
  };

  // Phone sign-in is part of the locked auth architecture but is NOT
  // implemented server-side in this milestone. Rejecting honestly here
  // rather than faking success — an explicit, visible limitation.
  const loginWithPhone: AuthContextValue["loginWithPhone"] = async () => {
    return { ok: false, error: "Phone sign-in isn't available yet — please sign in with your email." };
  };

  const register: AuthContextValue["register"] = async (fullName, email, password) => {
    setState((s) => ({ ...s, isLoading: true }));
    const { res, data } = await postJson("/api/auth/register", { fullName, email, password });
    if (!res.ok) {
      setState((s) => ({ ...s, isLoading: false }));
      return { ok: false, error: data.error ?? "Registration failed." };
    }
    setState({ user: data.user, isLoading: false });
    return { ok: true };
  };

  const logout = async () => {
    await postJson("/api/auth/logout");
    setState({ user: null, isLoading: false });
  };

  return (
    <AuthContext.Provider
      value={{ ...state, loginWithEmail, loginWithPhone, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
