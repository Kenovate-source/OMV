"use client";

import { type FormEvent } from "react";
import { Megaphone, Trash2, Info } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RequireRole } from "@/components/admin/RequireRole";
import { cn } from "@/lib/cn";
import {
  useAnnouncements,
  type AnnouncementType,
} from "@/lib/announcements/announcement-context";
import { useAdminAudit } from "@/lib/admin/admin-audit-context";
import { useAdminAuth } from "@/lib/admin/admin-auth-context";
import { useAdminNotifications } from "@/lib/admin/admin-notifications-context";

const TYPES: AnnouncementType[] = ["Info", "Promotion", "Maintenance", "Launch"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminAnnouncementsPage() {
  const { announcements, addAnnouncement, updateAnnouncement, removeAnnouncement } =
    useAnnouncements();
  const { logAction } = useAdminAudit();
  const { currentAdmin } = useAdminAuth();
  const { addNotification } = useAdminNotifications();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    if (!title || !message) return;
    addAnnouncement({
      title,
      message,
      type: fd.get("type") as AnnouncementType,
      startDate: String(fd.get("startDate") ?? todayISO()),
      endDate: String(fd.get("endDate") ?? todayISO()),
      active: true,
      ctaLabel: String(fd.get("ctaLabel") ?? "").trim() || undefined,
      ctaHref: String(fd.get("ctaHref") ?? "").trim() || undefined,
    });
    if (currentAdmin) logAction(currentAdmin.name, `Created announcement "${title}"`);
    addNotification(`Announcement published: ${title}`, "/admin/announcements");
    e.currentTarget.reset();
  }

  function toggleActive(id: string, active: boolean, title: string) {
    updateAnnouncement(id, { active: !active });
    if (currentAdmin) {
      logAction(currentAdmin.name, `${active ? "Deactivated" : "Activated"} announcement "${title}"`);
    }
  }

  function handleRemove(id: string, title: string) {
    removeAnnouncement(id);
    if (currentAdmin) logAction(currentAdmin.name, `Removed announcement "${title}"`);
  }

  return (
    <RequireRole roles={["super", "business"]}>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <Megaphone className="text-primary" aria-hidden="true" />
          <div>
            <h1 className="font-serif text-3xl text-foreground">Announcements</h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Manage the storefront announcement banner.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-card border border-dashed border-border bg-surface-elevated p-4 text-xs text-foreground-muted">
          <Info size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
          <p>
            Announcements are stored locally in this browser and shown only
            in this browser&apos;s storefront view — they are{" "}
            <strong className="text-foreground">not yet visible to other visitors</strong>.
            Real shared, cross-visitor delivery requires Phase 5&apos;s
            backend/database; the data structure here is designed to map
            directly onto that without changes.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="flex flex-col gap-4">
            {announcements.length === 0 ? (
              <p className="rounded-card border border-border bg-surface-elevated p-8 text-center text-sm text-foreground-muted">
                No announcements yet.
              </p>
            ) : (
              announcements.map((a) => (
                <li key={a.id}>
                  <Card className="flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-serif text-base text-foreground">{a.title}</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                          {a.type} · {a.startDate} → {a.endDate}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleActive(a.id, a.active, a.title)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs",
                            a.active ? "border-primary text-primary" : "border-border text-foreground-muted"
                          )}
                        >
                          {a.active ? "Active" : "Inactive"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(a.id, a.title)}
                          aria-label={`Remove ${a.title}`}
                          className="text-foreground-muted hover:text-red-400"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground-muted">{a.message}</p>
                  </Card>
                </li>
              ))
            )}
          </ul>

          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-card border border-border bg-surface-elevated p-6"
          >
            <h2 className="mb-4 font-serif text-lg text-foreground">New announcement</h2>
            <div className="flex flex-col gap-4">
              <Input label="Title" name="title" placeholder="New arrivals" required />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
                <textarea
                  name="message"
                  rows={3}
                  required
                  className="w-full rounded-input border border-border bg-surface px-4 py-3 text-sm text-foreground"
                  placeholder="OMV will be launching a new collection this Friday."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Type</label>
                <select
                  name="type"
                  defaultValue="Info"
                  className="h-11 w-full rounded-input border border-border bg-surface px-4 text-sm text-foreground"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start date" name="startDate" type="date" defaultValue={todayISO()} required />
                <Input label="End date" name="endDate" type="date" defaultValue={todayISO()} required />
              </div>
              <Input label="CTA label (optional)" name="ctaLabel" placeholder="Shop now" />
              <Input label="CTA link (optional)" name="ctaHref" placeholder="/women" />
              <Button type="submit">Create Announcement</Button>
            </div>
          </form>
        </div>
      </div>
    </RequireRole>
  );
}
