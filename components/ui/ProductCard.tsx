import Image from "next/image";
import { Heart } from "lucide-react";
import { Card } from "./Card";
import { cn } from "@/lib/cn";

export interface ProductCardProps {
  name: string;
  price: string;
  imageSrc: string;
  badge?: "New" | "Family Set" | "Premium";
  className?: string;
}

export function ProductCard({ name, price, imageSrc, badge, className }: ProductCardProps) {
  return (
    <Card className={cn("group flex flex-col gap-4 p-4", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-surface">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-250 group-hover:scale-105"
        />
        {badge && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium tracking-wide",
              badge === "Premium"
                ? "bg-gold text-gold-foreground"
                : "bg-accent text-accent-foreground"
            )}
          >
            {badge}
          </span>
        )}
        <button
          type="button"
          aria-label={`Add ${name} to wishlist`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition-colors hover:text-gold"
        >
          <Heart size={16} aria-hidden="true" />
        </button>
      </div>
      <div>
        <h3 className="font-serif text-base text-foreground">{name}</h3>
        <p className="text-sm text-foreground-muted">{price}</p>
      </div>
    </Card>
  );
}
