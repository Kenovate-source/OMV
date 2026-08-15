"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Megaphone, Sparkles, Wrench, Tag } from "lucide-react";
import { useAnnouncements, type AnnouncementType } from "@/lib/announcements/announcement-context";

const TYPE_ICON: Record<AnnouncementType, typeof Megaphone> = {
  Info: Megaphone,
  Promotion: Tag,
  Maintenance: Wrench,
  Launch: Sparkles,
};

const DISMISSED_KEY = "omv-dismissed-announcement";

export function AnnouncementBanner() {
  const { getActiveAnnouncement } = useAnnouncements();
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setDismissedId(window.localStorage.getItem(DISMISSED_KEY));
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const announcement = getActiveAnnouncement();

  if (!ready || !announcement || announcement.id === dismissedId) return null;

  const Icon = TYPE_ICON[announcement.type];

  function dismiss() {
    if (!announcement) return;
    try {
      window.localStorage.setItem(DISMISSED_KEY, announcement.id);
    } catch {
      // ignore
    }
    setDismissedId(announcement.id);
  }

  return (
    <div className="flex items-center justify-center gap-3 bg-accent px-4 py-2.5 text-center text-xs text-white sm:text-sm">
      <Icon size={14} className="hidden shrink-0 sm:block" aria-hidden="true" />
      <p>
        <span className="font-medium">{announcement.title}</span>
        {" — "}
        {announcement.message}
        {announcement.ctaLabel && announcement.ctaHref && (
          <Link href={announcement.ctaHref} className="ml-2 underline underline-offset-2 hover:no-underline">
            {announcement.ctaLabel}
          </Link>
        )}
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="shrink-0 text-white/80 hover:text-white"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
