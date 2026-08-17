"use client";

import { Gift, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useOrders } from "@/lib/orders/order-context";
import { formatNaira } from "@/lib/data/products";

const TIERS = [
  { name: "Member", min: 0 },
  { name: "Gold", min: 50 },
  { name: "Heritage", min: 150 },
];

export default function LoyaltyPage() {
  const { orders } = useOrders();
  const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);
  const points = Math.floor(totalSpend / 1000);

  // Highest tier whose threshold the customer has crossed; TIERS[0] always
  // exists (non-empty literal), but is typed possibly-undefined under this
  // project's noUncheckedIndexedAccess setting, so fall back explicitly
  // rather than re-indexing.
  const currentTier =
    [...TIERS].reverse().find((t) => points >= t.min) ?? { name: "Member", min: 0 };
  const nextTier = TIERS.find((t) => t.min > points);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Loyalty & Rewards</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Every purchase brings your family closer to rewards worth having.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-3 border-gold p-10 text-center">
        <Gift size={32} className="text-gold" aria-hidden="true" />
        <p className="font-serif text-4xl text-foreground">{points} pts</p>
        <p className="text-sm text-gold">{currentTier.name} tier</p>
        {nextTier && (
          <p className="text-xs text-foreground-muted">
            {nextTier.min - points} pts to {nextTier.name}
          </p>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((t) => (
          <Card key={t.name} className={cn(t.name === currentTier.name && "border-gold")}>
            <div className="flex items-center gap-2">
              <Star size={16} className="text-gold" aria-hidden="true" />
              <p className="font-serif text-base text-foreground">{t.name}</p>
            </div>
            <p className="mt-2 text-xs text-foreground-muted">{t.min}+ points</p>
          </Card>
        ))}
      </div>

      <p className="text-xs text-foreground-muted">
        Lifetime spend: {formatNaira(totalSpend)}. Points are earned at 1
        point per ₦1,000 spent — Phase 5 will connect this to real order
        settlement instead of local order history.
      </p>
    </div>
  );
}
