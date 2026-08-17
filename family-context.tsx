"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Flexible, non-exhaustive relationship list. Stored as a free-form string
// rather than a closed union so new relationships never require a code
// change — this list only powers the UI's suggested options.
export const RELATIONSHIP_OPTIONS = [
  "Self", "Partner", "Husband", "Wife", "Father", "Mother", "Brother",
  "Sister", "Son", "Daughter", "Grandfather", "Grandmother", "Uncle",
  "Aunt", "Cousin", "Nephew", "Niece", "Friend", "Fiancé", "Fiancée",
  "Colleague", "Other",
] as const;

export const AGE_GROUPS = ["Infant", "Toddler", "Child", "Teen", "Adult"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export const STYLE_PREFERENCES = [
  "Casual", "Smart", "Formal", "Traditional", "Streetwear", "Sporty",
  "Elegant", "Minimal", "Bold",
] as const;
export type StylePreference = (typeof STYLE_PREFERENCES)[number];

// Sizes are kept as free-form strings (not a closed enum) since size
// systems vary by clothing type and region (numeric, S/M/L, age-based for
// kids, etc.) — the UI offers common presets but never blocks a custom
// entry.
export interface ClothingSizes {
  tops: string;
  bottoms: string;
  dresses: string;
  outerwear: string;
  traditionalWear: string;
  other: string;
}

const EMPTY_SIZES: ClothingSizes = {
  tops: "",
  bottoms: "",
  dresses: "",
  outerwear: "",
  traditionalWear: "",
  other: "",
};

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  ageGroup: AgeGroup;
  genderPresentation: string;
  clothingSizes: ClothingSizes;
  shoeSize: string;
  stylePreferences: StylePreference[];
  colorPreferences: string[];
}

export type NewFamilyMember = Omit<FamilyMember, "id">;

interface FamilyContextValue {
  members: FamilyMember[];
  activeId: string | null;
  addMember: (member: NewFamilyMember) => void;
  updateMember: (id: string, patch: Partial<NewFamilyMember>) => void;
  removeMember: (id: string) => void;
  setActive: (id: string | null) => void;
}

const FamilyContext = createContext<FamilyContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-family";

// Migrates the Phase 3 shape ({ relation, sizeNote }) into the Phase 4
// refined shape so existing saved profiles in a reviewer's browser don't
// silently vanish after this update.
function migrateMember(raw: unknown): FamilyMember | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.name !== "string") return null;

  if (r.clothingSizes && typeof r.clothingSizes === "object") {
    // Already the new shape.
    return {
      id: r.id,
      name: r.name,
      relationship: typeof r.relationship === "string" ? r.relationship : "Other",
      ageGroup: (AGE_GROUPS as readonly string[]).includes(r.ageGroup as string)
        ? (r.ageGroup as AgeGroup)
        : "Adult",
      genderPresentation:
        typeof r.genderPresentation === "string" ? r.genderPresentation : "",
      clothingSizes: { ...EMPTY_SIZES, ...(r.clothingSizes as Partial<ClothingSizes>) },
      shoeSize: typeof r.shoeSize === "string" ? r.shoeSize : "",
      stylePreferences: Array.isArray(r.stylePreferences) ? r.stylePreferences as StylePreference[] : [],
      colorPreferences: Array.isArray(r.colorPreferences) ? r.colorPreferences as string[] : [],
    };
  }

  // Legacy Phase 3 shape: { relation, sizeNote }.
  return {
    id: r.id,
    name: r.name,
    relationship: typeof r.relation === "string" ? r.relation : "Other",
    ageGroup: "Adult",
    genderPresentation: "",
    clothingSizes: { ...EMPTY_SIZES, other: typeof r.sizeNote === "string" ? r.sizeNote : "" },
    shoeSize: "",
    stylePreferences: [],
    colorPreferences: [],
  };
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const rawMembers = Array.isArray(parsed.members) ? parsed.members : [];
        setMembers(rawMembers.map(migrateMember).filter((m: FamilyMember | null): m is FamilyMember => m !== null));
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

  const updateMember: FamilyContextValue["updateMember"] = (id, patch) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  };

  const setActive = (id: string | null) => setActiveId(id);

  return (
    <FamilyContext.Provider
      value={{ members, activeId, addMember, updateMember, removeMember, setActive }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used within a FamilyProvider");
  return ctx;
}

