"use client";

import { Mail, MessageSquare, Smartphone, Bell } from "lucide-react";
import { useNotificationPrefs, type NotificationPrefs } from "@/lib/notifications/notification-context";

const CHANNELS: {
  key: keyof NotificationPrefs;
  label: string;
  icon: typeof Mail;
  description: string;
}[] = [
  { key: "email", label: "Email", icon: Mail, description: "Order updates and receipts." },
  { key: "sms", label: "SMS", icon: Smartphone, description: "Delivery alerts by text message." },
  { key: "whatsapp", label: "WhatsApp", icon: MessageSquare, description: "Order tracking via WhatsApp." },
  { key: "push", label: "Push", icon: Bell, description: "App and browser notifications." },
];

export default function NotificationsPage() {
  const { prefs, togglePref } = useNotificationPrefs();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Notifications</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Choose how you&apos;d like OMV to keep you updated.
        </p>
      </div>

      <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-surface-elevated">
        {CHANNELS.map(({ key, label, icon: Icon, description }) => (
          <li key={key} className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <Icon size={18} className="text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm text-foreground">{label}</p>
                <p className="text-xs text-foreground-muted">{description}</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[key]}
              aria-label={`Toggle ${label} notifications`}
              onClick={() => togglePref(key)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                prefs[key] ? "bg-primary" : "bg-surface"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                  prefs[key] ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>

      <p className="text-xs text-foreground-muted">
        These preferences are saved locally for now. Phase 5 wires them to
        real Email, SMS, WhatsApp and Push delivery.
      </p>
    </div>
  );
}
