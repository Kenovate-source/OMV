"use client";

import {
  createContext,
  useContext,
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

interface AuthContextValue extends AuthState {
  loginWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithPhone: (phone: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Phase 1 stub: holds shape and flow only. Guest browsing is the default
 * everywhere except checkout / wishlist / orders / family profiles / AI
 * personalization (PRD §Authentication). Real JWT + refresh-token wiring
 * against the NestJS API lands in Phase 5.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isLoading: false });

  const loginWithEmail: AuthContextValue["loginWithEmail"] = async () => {
    setState((s) => ({ ...s, isLoading: true }));
    // TODO(Phase 5): POST /auth/login { email, password, rememberMe }
    setState({ user: null, isLoading: false });
  };

  const loginWithPhone: AuthContextValue["loginWithPhone"] = async () => {
    setState((s) => ({ ...s, isLoading: true }));
    // TODO(Phase 5): POST /auth/login { phone, password, rememberMe }
    setState({ user: null, isLoading: false });
  };

  const register: AuthContextValue["register"] = async () => {
    setState((s) => ({ ...s, isLoading: true }));
    // TODO(Phase 5): POST /auth/register { fullName, email, password }
    setState({ user: null, isLoading: false });
  };

  const logout = () => setState({ user: null, isLoading: false });

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
