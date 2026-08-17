import Image from "next/image";
import Link from "next/link";
import { Sparkles, Users, Shirt, Gift } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const PILLARS = [
  {
    icon: Users,
    title: "Family Shopping",
    description:
      "One account, one cart, every family member's profile and sizes in one calm, organized place.",
    accent: "primary" as const,
  },
  {
    icon: Shirt,
    title: "Complete the Look",
    description:
      "Curated pairings for every piece you choose — styling guidance, not guesswork.",
    accent: "primary" as const,
  },
  {
    icon: Sparkles,
    title: "AI Fashion Assistant",
    description:
      "Personal styling suggestions tailored to your taste, occasion and family — arriving in Phase 3.",
    accent: "accent" as const,
  },
  {
    icon: Gift,
    title: "Loyalty & Rewards",
    description:
      "Every purchase brings your family closer to rewards worth having.",
    accent: "gold" as const,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero — the signature moment: full lockup, tagline, calm gradient */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--accent)/0.18),transparent_45%),radial-gradient(circle_at_80%_0%,hsl(var(--gold)/0.12),transparent_40%)]"
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-28 text-center">
          <Image
            src="/brand/logo-transparent.png"
            alt=""
            width={120}
            height={120}
            priority
            className="mb-8"
          />
          <h1 className="max-w-3xl font-serif text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
            Every Outfit. Every Occasion. Every Family.
          </h1>
          <p className="mt-6 max-w-xl text-base text-foreground-muted sm:text-lg">
            A boutique shopping experience for the whole family — curated
            fashion, personal styling and a calmer way to dress well.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/women" className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
              Shop the Collection
            </Link>
            <Link
              href="/family-shopping"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Explore Family Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* Brand pillars — what makes OMV different from a marketplace */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-gold">
            Why OMV
          </p>
          <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
            A shopping experience built around your family, not a marketplace.
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, description, accent }) => (
            <Card key={title} className="flex flex-col gap-4">
              <span
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-full",
                  accent === "primary" && "bg-primary/15 text-primary",
                  accent === "accent" && "bg-accent/15 text-accent",
                  accent === "gold" && "bg-gold/15 text-gold"
                )}
              >
                <Icon size={22} aria-hidden="true" />
              </span>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 text-center sm:grid-cols-3">
          <div>
            <p className="font-serif text-3xl text-gold">Curated</p>
            <p className="mt-2 text-sm text-foreground-muted">
              Every collection hand-selected for quality and fit.
            </p>
          </div>
          <div>
            <p className="font-serif text-3xl text-gold">Trusted</p>
            <p className="mt-2 text-sm text-foreground-muted">
              Transparent orders, tracking and real customer care.
            </p>
          </div>
          <div>
            <p className="font-serif text-3xl text-gold">Personal</p>
            <p className="mt-2 text-sm text-foreground-muted">
              Styling built around your family, not a generic catalogue.
            </p>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-2xl font-serif text-3xl text-foreground sm:text-4xl">
          Create your family profile and start building your look.
        </h2>
        <div className="mt-8">
          <Link href="/register" className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
            Create Your Account
          </Link>
        </div>
      </section>
    </>
  );
}
