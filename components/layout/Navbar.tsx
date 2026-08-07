"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Search, Heart, ShoppingBag, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/women", label: "Women" },
  { href: "/men", label: "Men" },
  { href: "/kids", label: "Kids" },
  { href: "/family-shopping", label: "Family Shopping" },
  { href: "/complete-the-look", label: "Complete the Look" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="OMV home">
          {/* Full lockup: appropriate here — nav has room on desktop */}
          <Image
            src="/brand/logo-transparent.png"
            alt="Overcomers Multipurpose Ventures"
            width={44}
            height={44}
            className="hidden sm:block"
            priority
          />
          <span className="font-serif text-lg tracking-wide text-foreground sm:hidden">
            OMV
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-foreground-muted transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Search"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-foreground hover:text-gold sm:inline-flex"
          >
            <Search size={18} aria-hidden="true" />
          </button>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-foreground hover:text-gold sm:inline-flex"
          >
            <Heart size={18} aria-hidden="true" />
          </Link>
          <Link
            href="/cart"
            aria-label="Shopping bag"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-foreground hover:text-gold sm:inline-flex"
          >
            <ShoppingBag size={18} aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden lg:inline-flex"
            )}
          >
            <User size={16} aria-hidden="true" /> Sign in
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-border bg-background px-6 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base text-foreground hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/login" onClick={() => setOpen(false)} className="text-base text-gold">
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
