import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// Variant colours follow Brand Book §13 & §15: emerald is the default
// interactive colour, purple is reserved for AI-related actions, gold is
// used sparingly for premium emphasis (never as the default CTA colour).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button text-sm font-medium tracking-wide transition-all duration-250 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:shadow-premium hover:brightness-110",
        outline:
          "border border-border bg-transparent text-foreground hover:border-gold hover:text-gold",
        ghost: "bg-transparent text-foreground hover:bg-surface",
        ai: "bg-accent text-accent-foreground hover:brightness-110",
        premium: "bg-gold text-gold-foreground hover:shadow-gold hover:brightness-105",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
