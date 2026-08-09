"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  MapPin,
  Package,
  Gift,
  Bell,
  Sparkles,
  Shirt,
  ClipboardList,
  Info,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/account", label: "Overview", icon: User },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/loyalty", label: "Loyalty", icon: Gift },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/ai-stylist", label: "AI Stylist", icon: Sparkles },
  { href: "/account/outfit-builder", label: "Outfit Builder", icon: Shirt },
  { href: "/account/style-quiz", label: "Style Quiz", icon: ClipboardList },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-6 flex items-start gap-3 rounded-card border border-dashed border-border bg-surface-elevated p-4 text-xs text-foreground-muted">
        <Info size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
        <p>
          Your account dashboard is saved locally in this browser for review
          purposes. It will connect to your signed-in account once real
          authentication ships in Phase 5.
        </p>
      </div>

      {/* Mobile tab bar */}
      <nav
        aria-label="Account sections"
        className="mb-8 flex gap-2 overflow-x-auto pb-2 lg:hidden"
      >
        {NAV.map(({ href, label, icon: Icon }) => {
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
            </Link>
          );
        })}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Account sections" className="hidden flex-col gap-1 lg:flex">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-input border px-4 py-3 text-sm transition-colors",
                  active
                    ? "border-border bg-surface-elevated text-gold"
                    : "border-transparent text-foreground-muted hover:text-foreground"
                )}
              >
                <Icon size={16} aria-hidden="true" /> {label}
              </Link>
            );
          })}
        </nav>

        <div>{children}</div>
      </div>
    </div>
  );
}
