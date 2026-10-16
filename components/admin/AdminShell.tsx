"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Boxes,
  Shirt,
  Users,
  Package,
  Tag,
  Star,
  BarChart3,
  ScrollText,
  Bell,
  Megaphone,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAdminAuth, type AdminRole } from "@/lib/admin/admin-auth-context";
import { useAdminNotifications } from "@/lib/admin/admin-notifications-context";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: AdminRole[];
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["super", "business", "staff"] },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes, roles: ["super", "business", "staff"] },
  { href: "/admin/products", label: "Products", icon: Shirt, roles: ["super", "business"] },
  { href: "/admin/customers", label: "Customers", icon: Users, roles: ["super", "business", "staff"] },
  { href: "/admin/orders", label: "Orders", icon: Package, roles: ["super", "business", "staff"] },
  { href: "/admin/promotions", label: "Promotions", icon: Tag, roles: ["super", "business"] },
  { href: "/admin/reviews", label: "Reviews", icon: Star, roles: ["super", "business"] },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone, roles: ["super", "business"] },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, roles: ["super", "business"] },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText, roles: ["super"] },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, roles: ["super", "business", "staff"] },
];

const ROLE_LABEL: Record<AdminRole, string> = {
  super: "Super Admin",
  business: "Business Admin",
  staff: "Staff Admin",
};

function AdminLoginForm() {
  const { signIn } = useAdminAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await signIn(
      String(formData.get("email") ?? ""),
      String(formData.get("password") ?? "")
    );
    setSubmitting(false);
    if (!result.ok) setError(result.error ?? "Sign-in failed.");
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-24 text-center">
      <ShieldCheck size={32} className="mx-auto text-gold" aria-hidden="true" />
      <h1 className="mt-4 font-serif text-3xl text-foreground">OMV Admin Portal</h1>
      <p className="mt-2 text-sm text-foreground-muted">
        Sign in with your administrator account.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 text-left">
        <div>
          <label htmlFor="admin-email" className="mb-1.5 block text-sm text-foreground">
            Email address
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="h-11 w-full rounded-input border border-border bg-surface px-4 text-sm text-foreground"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="mb-1.5 block text-sm text-foreground">
            Password
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-11 w-full rounded-input border border-border bg-surface px-4 text-sm text-foreground"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="h-12 rounded-button bg-primary px-6 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentAdmin, isLoading, signOut, can } = useAdminAuth();
  const { unreadCount } = useAdminNotifications();

  // While the session is being restored from /api/admin/auth/me, render
  // nothing rather than flashing the login form at an already-signed-in admin.
  if (isLoading) return null;
  if (!currentAdmin) return <AdminLoginForm />;

  const visibleNav = NAV.filter((n) => can(n.roles));

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-card border border-dashed border-border bg-surface-elevated p-4 text-xs text-foreground-muted">
        <p>
          Signed in as <span className="text-foreground">{currentAdmin.name}</span> ·{" "}
          <span className="text-gold">{ROLE_LABEL[currentAdmin.role]}</span>.
          Sign-in and role enforcement are real (server-side). Product,
          inventory, order and other admin data on these pages is still
          browser-local prototype data until its backend is built — edits
          here are not yet saved to the shared database.
        </p>
        <button
          type="button"
          onClick={signOut}
          className="flex shrink-0 items-center gap-1.5 text-foreground hover:text-gold"
        >
          <LogOut size={14} aria-hidden="true" /> Sign out
        </button>
      </div>

      <nav aria-label="Admin sections" className="mb-8 flex gap-2 overflow-x-auto pb-2 lg:hidden">
        {visibleNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs",
                active
                  ? "border-gold bg-gold text-gold-foreground"
                  : "border-border text-foreground-muted"
              )}
            >
              <Icon size={14} aria-hidden="true" /> {label}
              {href === "/admin/notifications" && unreadCount > 0 && (
                <span className="ml-1 rounded-full bg-accent px-1.5 text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Admin sections" className="hidden flex-col gap-1 lg:flex">
          {visibleNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-input border px-4 py-3 text-sm transition-colors",
                  active
                    ? "border-border bg-surface-elevated text-gold"
                    : "border-transparent text-foreground-muted hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} aria-hidden="true" /> {label}
                </span>
                {href === "/admin/notifications" && unreadCount > 0 && (
                  <span className="rounded-full bg-accent px-1.5 text-[10px] text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div>{children}</div>
      </div>
    </div>
  );
}
