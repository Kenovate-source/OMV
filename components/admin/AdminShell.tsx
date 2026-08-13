"use client";

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
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAdminAuth, ADMIN_SEED, type AdminRole } from "@/lib/admin/admin-auth-context";
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
  { href: "/admin/reports", label: "Reports", icon: BarChart3, roles: ["super", "business"] },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText, roles: ["super"] },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, roles: ["super", "business", "staff"] },
];

const ROLE_LABEL: Record<AdminRole, string> = {
  super: "Super Admin",
  business: "Business Admin",
  staff: "Staff Admin",
};

function LoginPicker() {
  const { signInAs } = useAdminAuth();
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <ShieldCheck size={32} className="mx-auto text-gold" aria-hidden="true" />
      <h1 className="mt-4 font-serif text-3xl text-foreground">OMV Admin Portal</h1>
      <p className="mt-2 text-sm text-foreground-muted">
        Sign in as one of the 5 seeded administrators to preview role-based
        access. Real authentication and unlimited admin accounts are wired
        up in Phase 5.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        {ADMIN_SEED.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => signInAs(a.id)}
            className="flex items-center justify-between rounded-input border border-border bg-surface-elevated px-5 py-4 text-left transition-colors hover:border-gold"
          >
            <span>
              <span className="block text-sm text-foreground">{a.name}</span>
              <span className="block text-xs text-foreground-muted">{a.email}</span>
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-gold">
              {ROLE_LABEL[a.role]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentAdmin, signOut, can } = useAdminAuth();
  const { unreadCount } = useAdminNotifications();

  if (!currentAdmin) return <LoginPicker />;

  const visibleNav = NAV.filter((n) => can(n.roles));

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-card border border-dashed border-border bg-surface-elevated p-4 text-xs text-foreground-muted">
        <p>
          Signed in as <span className="text-foreground">{currentAdmin.name}</span> ·{" "}
          <span className="text-gold">{ROLE_LABEL[currentAdmin.role]}</span>. This
          portal previews RBAC locally — real multi-admin authentication
          ships in Phase 5.
        </p>
        <button
          type="button"
          onClick={signOut}
          className="flex shrink-0 items-center gap-1.5 text-foreground hover:text-gold"
        >
          <LogOut size={14} aria-hidden="true" /> Switch admin
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
