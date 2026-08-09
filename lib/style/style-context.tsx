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
}

interface StyleContextValue {
  styleProfile: string | null;
  setStyleProfile: (profile: string) => void;
  savedOutfits: SavedOutfit[];
  saveOutfit: (name: string, productIds: string[]) => void;
  removeOutfit: (id: string) => void;
}

const StyleContext = createContext<StyleContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-style";

export function StyleProvider({ children }: { children: ReactNode }) {
  const [styleProfile, setStyleProfileState] = useState<string | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setStyleProfileState(parsed.styleProfile ?? null);
        setSavedOutfits(parsed.savedOutfits ?? []);
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ styleProfile, savedOutfits })
    );
  }, [styleProfile, savedOutfits, hydrated]);

  const setStyleProfile = (profile: string) => setStyleProfileState(profile);

  const saveOutfit = (name: string, productIds: string[]) => {
    const id = `${Date.now()}`;
    setSavedOutfits((prev) => [...prev, { id, name, productIds }]);
  };

  const removeOutfit = (id: string) =>
    setSavedOutfits((prev) => prev.filter((o) => o.id !== id));

  return (
    <StyleContext.Provider
      value={{ styleProfile, setStyleProfile, savedOutfits, saveOutfit, removeOutfit }}
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
