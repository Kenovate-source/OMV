"use client";

import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";
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
            Tap a notification to open what it&apos;s about — orders,
            reports, reviews, inventory, products and announcements all
            link through. Opening one marks it read.
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="rounded-card border border-border bg-surface-elevated p-8 text-center text-sm text-foreground-muted">
          You&apos;re all caught up.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-surface-elevated">
          {notifications.map((n) => {
            const content = (
              <>
                <div className="flex-1 text-left">
                  <p className={cn("text-sm", n.read ? "text-foreground-muted" : "text-foreground")}>
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!n.read && <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />}
                  {n.href && <ChevronRight size={16} className="text-foreground-muted" aria-hidden="true" />}
                </div>
              </>
            );

            return (
              <li key={n.id}>
                {n.href ? (
                  <Link
                    href={n.href}
                    onClick={() => markRead(n.id)}
                    className="flex items-center gap-4 p-5 transition-colors hover:bg-surface"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-surface"
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
