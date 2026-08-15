"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface SavedOutfit {
  id: string;
  name: string;
  productIds: string[];
  occasion?: string;
}

export type FitPreference = "Loose" | "Fitted" | "Either";
export type Formality = "Very casual" | "Casual" | "Balanced" | "Smart" | "Very formal";

// Structured, reusable preference data — this is what Outfit Builder,
// Complete the Look, and any future recommendation logic actually read.
// The friendly "styleLabel" is a display-only summary derived from this,
// not the source of truth (Phase 3 originally only stored the label).
export interface StylePreferences {
  favoriteColors: string[];
  fitPreference: FitPreference | null;
  favoriteClothingTypes: string[];
  favoriteStyles: string[];
  preferredShoes: string[];
  preferredAccessories: string[];
  commonOccasions: string[];
  formality: Formality | null;
}

export const EMPTY_PREFERENCES: StylePreferences = {
  favoriteColors: [],
  fitPreference: null,
  favoriteClothingTypes: [],
  favoriteStyles: [],
  preferredShoes: [],
  preferredAccessories: [],
  commonOccasions: [],
  formality: null,
};

interface StyleContextValue {
  preferences: StylePreferences;
  styleLabel: string | null;
  hasCompletedQuiz: boolean;
  savePreferences: (prefs: StylePreferences) => void;
  savedOutfits: SavedOutfit[];
  saveOutfit: (name: string, productIds: string[], occasion?: string) => void;
  removeOutfit: (id: string) => void;
}

const StyleContext = createContext<StyleContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-style";

// Derives a friendly display label from structured answers — display-only,
// never read back as input by anything else.
function deriveLabel(prefs: StylePreferences): string | null {
  if (!prefs.formality) return null;
  if (prefs.favoriteStyles.includes("Bold")) return "Bold Statement";
  if (prefs.favoriteStyles.includes("Traditional")) return "Relaxed Heritage";
  if (prefs.formality === "Very formal" || prefs.formality === "Smart") return "Modern Minimalist";
  return "Relaxed Everyday";
}

export function StyleProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<StylePreferences>(EMPTY_PREFERENCES);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate Phase 3 shape ({ styleProfile: string }) — no structured
        // preferences existed then, so start fresh but keep saved outfits.
        setPreferences({ ...EMPTY_PREFERENCES, ...(parsed.preferences ?? {}) });
        setSavedOutfits(parsed.savedOutfits ?? []);
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ preferences, savedOutfits }));
  }, [preferences, savedOutfits, hydrated]);

  const savePreferences = (prefs: StylePreferences) => setPreferences(prefs);

  const saveOutfit: StyleContextValue["saveOutfit"] = (name, productIds, occasion) => {
    const id = `${Date.now()}`;
    setSavedOutfits((prev) => [...prev, { id, name, productIds, occasion }]);
  };

  const removeOutfit = (id: string) =>
    setSavedOutfits((prev) => prev.filter((o) => o.id !== id));

  const hasCompletedQuiz = preferences.formality !== null;
  const styleLabel = deriveLabel(preferences);

  return (
    <StyleContext.Provider
      value={{
        preferences,
        styleLabel,
        hasCompletedQuiz,
        savePreferences,
        savedOutfits,
        saveOutfit,
        removeOutfit,
      }}
    >
      {children}
    </StyleContext.Provider>
  );
}

export function useStyle() {
  const ctx = useContext(StyleContext);
  if (!ctx) throw new Error("useStyle must be used within a StyleProvider");
  return ctx;
}
