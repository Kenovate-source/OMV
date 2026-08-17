"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface NotificationPrefs {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  push: boolean;
}

interface NotificationContextValue {
  prefs: NotificationPrefs;
  togglePref: (key: keyof NotificationPrefs) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-notification-prefs";
const DEFAULT_PREFS: NotificationPrefs = {
  email: true,
  sms: false,
  whatsapp: true,
  push: true,
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs, hydrated]);

  const togglePref = (key: keyof NotificationPrefs) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <NotificationContext.Provider value={{ prefs, togglePref }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationPrefs() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotificationPrefs must be used within a NotificationProvider");
  return ctx;
}
