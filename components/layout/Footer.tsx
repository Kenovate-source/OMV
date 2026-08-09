import Image from "next/image";
import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/women", label: "Women" },
      { href: "/men", label: "Men" },
      { href: "/kids", label: "Kids" },
      { href: "/family-shopping", label: "Family Shopping" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/account", label: "My Account" },
      { href: "/account/orders", label: "Order Tracking" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/account/loyalty", label: "Loyalty & Rewards" },
      { href: "/login", label: "Sign In" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About OMV" },
      { href: "/stores", label: "Store Locations" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Image
              src="/brand/logo-transparent.png"
              alt="Overcomers Multipurpose Ventures"
              width={72}
              height={72}
            />
            <p className="mt-4 max-w-xs font-serif text-lg text-foreground">
              Every Outfit. Every Occasion. Every Family.
            </p>
            <p className="mt-3 max-w-xs text-sm text-foreground-muted">
              Premium, curated family fashion — delivered with the trust and
              warmth of a boutique.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-serif text-sm tracking-wide text-gold">
                  {col.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground-muted transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Overcomers Multipurpose Ventures. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
