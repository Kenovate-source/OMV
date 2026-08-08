"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface FamilyMember {
  id: string;
  name: string;
  relation: "Self" | "Partner" | "Child" | "Other";
  sizeNote: string;
}

interface FamilyContextValue {
  members: FamilyMember[];
  activeId: string | null;
  addMember: (member: Omit<FamilyMember, "id">) => void;
  removeMember: (id: string) => void;
  setActive: (id: string | null) => void;
}

const FamilyContext = createContext<FamilyContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-family";

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMembers(parsed.members ?? []);
        setActiveId(parsed.activeId ?? null);
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ members, activeId }));
  }, [members, activeId, hydrated]);

  const addMember: FamilyContextValue["addMember"] = (member) => {
    const id = `${Date.now()}`;
    setMembers((prev) => [...prev, { ...member, id }]);
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  };

  const setActive = (id: string | null) => setActiveId(id);

  return (
    <FamilyContext.Provider value={{ members, activeId, addMember, removeMember, setActive }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used within a FamilyProvider");
  return ctx;
}
