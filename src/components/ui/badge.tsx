import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "",
  {
    variants: {
      variant: {
        default: "text-[var(--color-ink)] bg-[var(--color-bg)]",
        accent: "text-[var(--color-accent)] bg-[var(--color-bg)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.ComponentProps<typeof Slot>,
    VariantProps<typeof badgeVariants> {
}

const Badge = React.forwardRef<
  HTMLElement,
  BadgeProps
>(({ className, variant, ...props }, ref) => {
  return (
    <Slot
      className={cn(
        badgeVariants({ variant }),
        "badge",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export { Badge };