"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface Profile {
  fullName: string;
  email: string;
  phone: string;
}

interface ProfileContextValue {
  profile: Profile;
  updateProfile: (patch: Partial<Profile>) => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-profile";
const DEFAULT_PROFILE: Profile = { fullName: "", email: "", phone: "" };

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(stored) });
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile, hydrated]);

  const updateProfile = (patch: Partial<Profile>) =>
    setProfile((p) => ({ ...p, ...patch }));

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
