import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/lib/orders/order-context";

const STEPS: OrderStatus[] = ["Placed", "Processing", "Shipped", "Delivered"];

export function OrderTracker({ status }: { status: OrderStatus }) {
  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center" role="list" aria-label={`Order status: ${status}`}>
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step} role="listitem" className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground-muted"
                )}
              >
                {done ? <Check size={14} aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn("text-[11px]", done ? "text-foreground" : "text-foreground-muted")}>
                {step}
              </span>
            </div>
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn("mx-2 h-px flex-1", i < currentIndex ? "bg-primary" : "bg-border")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
