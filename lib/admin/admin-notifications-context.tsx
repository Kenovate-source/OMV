"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useOrders } from "@/lib/orders/order-context";

export interface AdminNotification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
  /** Where clicking this notification should navigate. Absent means the
   * notification has no specific destination — clicking it still marks it
   * read (there's no further detail to reveal since messages here are
   * never truncated). */
  href?: string;
}

const SEED: AdminNotification[] = [
  {
    id: "n1",
    message: "Weekly sales report is ready to review.",
    read: false,
    timestamp: new Date().toISOString(),
    href: "/admin/reports",
  },
  {
    id: "n2",
    message: "Product reviews are awaiting moderation.",
    read: false,
    timestamp: new Date().toISOString(),
    href: "/admin/reviews",
  },
];

interface AdminNotificationsContextValue {
  notifications: AdminNotification[];
  markRead: (id: string) => void;
  unreadCount: number;
  /** Lets other admin surfaces (product edits, inventory, announcements)
   * push a real, actionable notification rather than this list only ever
   * containing seed data plus order events. */
  addNotification: (message: string, href?: string) => void;
}

const AdminNotificationsContext = createContext<AdminNotificationsContextValue | undefined>(
  undefined
);
const STORAGE_KEY = "omv-admin-notifications";

export function AdminNotificationsProvider({ children }: { children: ReactNode }) {
  const { orders } = useOrders();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const knownOrderIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setNotifications(stored ? JSON.parse(stored) : SEED);
    } catch {
      setNotifications(SEED);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications, hydrated]);

  const addNotification: AdminNotificationsContextValue["addNotification"] = (message, href) => {
    setNotifications((prev) => [
      {
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        message,
        href,
        read: false,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // Real integration: a genuinely new order (placed via the actual
  // storefront checkout) generates a notification here, deep-linked to
  // that order in Admin Orders (matched by anchor id — see
  // app/admin/orders/page.tsx). The first run after hydration just
  // records existing order ids as a baseline so past history doesn't spam
  // the notification list on load.
  useEffect(() => {
    if (!hydrated) return;
    if (!initialized.current) {
      orders.forEach((o) => knownOrderIds.current.add(o.id));
      initialized.current = true;
      return;
    }
    const newOnes = orders.filter((o) => !knownOrderIds.current.has(o.id));
    if (newOnes.length === 0) return;
    newOnes.forEach((o) => knownOrderIds.current.add(o.id));
    setNotifications((prev) => [
      ...newOnes.map((o) => ({
        id: `order-${o.id}`,
        message: `New order received: ${o.id}`,
        read: false,
        timestamp: new Date().toISOString(),
        href: `/admin/orders#${o.id}`,
      })),
      ...prev,
    ]);
  }, [orders, hydrated]);

  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AdminNotificationsContext.Provider
      value={{ notifications, markRead, unreadCount, addNotification }}
    >
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  const ctx = useContext(AdminNotificationsContext);
  if (!ctx)
    throw new Error("useAdminNotifications must be used within an AdminNotificationsProvider");
  return ctx;
}
