"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Package, Heart, Gift } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useProfile } from "@/lib/profile/profile-context";
import { useOrders } from "@/lib/orders/order-context";
import { useWishlist } from "@/lib/wishlist/wishlist-context";

export default function AccountOverviewPage() {
  const { profile, updateProfile } = useProfile();
  const { orders } = useOrders();
  const { ids } = useWishlist();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateProfile({
      fullName: String(fd.get("fullName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  const points = orders.reduce((sum, o) => sum + Math.floor(o.total / 1000), 0);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-serif text-3xl text-foreground">My Profile</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Manage your details and keep track of everything happening on your account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/account/orders" aria-label={`${orders.length} orders`}>
          <Card className="flex items-center gap-4 p-5">
            <Package className="text-primary" aria-hidden="true" />
            <div>
              <p className="font-serif text-xl text-foreground">{orders.length}</p>
              <p className="text-xs text-foreground-muted">Orders</p>
            </div>
          </Card>
        </Link>
        <Link href="/wishlist" aria-label={`${ids.length} wishlist items`}>
          <Card className="flex items-center gap-4 p-5">
            <Heart className="text-accent" aria-hidden="true" />
            <div>
              <p className="font-serif text-xl text-foreground">{ids.length}</p>
              <p className="text-xs text-foreground-muted">Wishlist</p>
            </div>
          </Card>
        </Link>
        <Link href="/account/loyalty" aria-label={`${points} loyalty points`}>
          <Card className="flex items-center gap-4 p-5">
            <Gift className="text-gold" aria-hidden="true" />
            <div>
              <p className="font-serif text-xl text-foreground">{points}</p>
              <p className="text-xs text-foreground-muted">Loyalty Points</p>
            </div>
          </Card>
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-md rounded-card border border-border bg-surface-elevated p-6"
      >
        <h2 className="mb-4 font-serif text-lg text-foreground">Personal Details</h2>
        <div className="flex flex-col gap-4">
          <Input label="Full name" name="fullName" defaultValue={profile.fullName} />
          <Input label="Email" name="email" type="email" defaultValue={profile.email} />
          <Input label="Phone" name="phone" type="tel" defaultValue={profile.phone} />
          <Button type="submit">{saved ? "Saved ✓" : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
