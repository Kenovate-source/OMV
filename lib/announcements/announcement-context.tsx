"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type AnnouncementType = "Info" | "Promotion" | "Maintenance" | "Launch";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  startDate: string; // ISO date
  endDate: string; // ISO date
  active: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}

const SEED: Announcement[] = [
  {
    id: "ann-1",
    title: "New arrivals",
    message: "Our new seasonal collection is now available — every outfit, every occasion.",
    type: "Launch",
    startDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    active: true,
    ctaLabel: "Shop now",
    ctaHref: "/women",
  },
];

interface AnnouncementContextValue {
  announcements: Announcement[];
  addAnnouncement: (a: Omit<Announcement, "id">) => void;
  updateAnnouncement: (id: string, patch: Partial<Omit<Announcement, "id">>) => void;
  removeAnnouncement: (id: string) => void;
  /** Storefront-facing: the single announcement (if any) that is active
   * and within its date window right now. Local to this browser only —
   * see the module note below. */
  getActiveAnnouncement: () => Announcement | undefined;
}

const AnnouncementContext = createContext<AnnouncementContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-announcements";

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setAnnouncements(stored ? JSON.parse(stored) : SEED);
    } catch {
      setAnnouncements(SEED);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements));
  }, [announcements, hydrated]);

  const addAnnouncement: AnnouncementContextValue["addAnnouncement"] = (a) => {
    const id = `ann-${Date.now()}`;
    setAnnouncements((prev) => [{ ...a, id }, ...prev]);
  };

  const updateAnnouncement: AnnouncementContextValue["updateAnnouncement"] = (id, patch) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const removeAnnouncement = (id: string) =>
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));

  // IMPORTANT ARCHITECTURE NOTE: this reads from this browser's own
  // localStorage only. An admin "publishing" an announcement here makes it
  // visible in THIS browser's storefront view, not to other visitors —
  // there is no shared backend/database in Phase 4. Once Phase 5's real
  // database exists, this function's signature stays the same but its
  // implementation becomes a fetch to a shared announcements API, so the
  // storefront banner component below never needs to change.
  const getActiveAnnouncement: AnnouncementContextValue["getActiveAnnouncement"] = () => {
    const today = new Date().toISOString().slice(0, 10);
    return announcements.find(
      (a) => a.active && a.startDate <= today && today <= a.endDate
    );
  };

  return (
    <AnnouncementContext.Provider
      value={{ announcements, addAnnouncement, updateAnnouncement, removeAnnouncement, getActiveAnnouncement }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  const ctx = useContext(AnnouncementContext);
  if (!ctx) throw new Error("useAnnouncements must be used within an AnnouncementProvider");
  return ctx;
}
