"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Menu, X, Search, Heart, ShoppingBag, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/cart/cart-context";
import { useWishlist } from "@/lib/wishlist/wishlist-context";

const NAV_LINKS = [
  { href: "/women", label: "Women" },
  { href: "/men", label: "Men" },
  { href: "/kids", label: "Kids" },
  { href: "/family-shopping", label: "Family Shopping" },
  { href: "/complete-the-look", label: "Complete the Look" },
];

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-gold-foreground"
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { itemCount } = useCart();
  const { ids: wishlistIds } = useWishlist();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

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
          <div className="relative hidden sm:block">
            <button
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:text-gold"
            >
              <Search size={18} aria-hidden="true" />
            </button>
            {searchOpen && (
              <form
                onSubmit={handleSearch}
                className="absolute right-0 top-12 w-72 rounded-input border border-border bg-surface-elevated p-2 shadow-premium"
              >
                <label htmlFor="nav-search" className="sr-only">
                  Search products
                </label>
                <input
                  id="nav-search"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  className="h-10 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-gold"
                />
              </form>
            )}
          </div>
          <Link
            href="/wishlist"
            aria-label={`Wishlist${wishlistIds.length ? `, ${wishlistIds.length} items` : ""}`}
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-foreground hover:text-gold sm:inline-flex"
          >
            <Heart size={18} aria-hidden="true" />
            <CountBadge count={wishlistIds.length} />
          </Link>
          <Link
            href="/cart"
            aria-label={`Shopping bag${itemCount ? `, ${itemCount} items` : ""}`}
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-foreground hover:text-gold sm:inline-flex"
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <CountBadge count={itemCount} />
          </Link>
          <ThemeToggle />
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/account"
              className="text-sm text-foreground-muted transition-colors hover:text-gold"
            >
              My Account
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <User size={16} aria-hidden="true" /> Sign in
            </Link>
          </div>

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
          <form onSubmit={handleSearch} className="mb-4 sm:hidden">
            <label htmlFor="mobile-search" className="sr-only">
              Search products
            </label>
            <input
              id="mobile-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="h-11 w-full rounded-input border border-border bg-surface px-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-gold"
            />
          </form>
          <ul className="flex flex-col gap-4">
            <li className="flex gap-6 sm:hidden">
              <Link href="/wishlist" onClick={() => setOpen(false)} className="text-base text-foreground hover:text-gold">
                Wishlist{wishlistIds.length ? ` (${wishlistIds.length})` : ""}
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="text-base text-foreground hover:text-gold">
                Cart{itemCount ? ` (${itemCount})` : ""}
              </Link>
            </li>
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
              <Link href="/account" onClick={() => setOpen(false)} className="text-base text-foreground hover:text-gold">
                My Account
              </Link>
            </li>
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
