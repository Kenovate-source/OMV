"use client";

import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAdminNotifications } from "@/lib/admin/admin-notifications-context";

export default function AdminNotificationsPage() {
  const { notifications, markRead } = useAdminNotifications();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Bell className="text-primary" aria-hidden="true" />
        <div>
          <h1 className="font-serif text-3xl text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            System alerts, including live updates when new orders come in.
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="rounded-card border border-border bg-surface-elevated p-8 text-center text-sm text-foreground-muted">
          You&apos;re all caught up.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-surface-elevated">
          {notifications.map((n) => (
            <li key={n.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className={cn("text-sm", n.read ? "text-foreground-muted" : "text-foreground")}>
                  {n.message}
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                  {new Date(n.timestamp).toLocaleString()}
                </p>
              </div>
              {!n.read && (
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-foreground-muted hover:border-gold hover:text-gold"
                >
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
