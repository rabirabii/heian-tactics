import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-small)] border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-vermillion)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-[var(--border-ink)] bg-transparent text-[var(--foreground)]",
        accent: "border-[var(--border-ink)] border-l-[3px] border-l-[var(--accent-vermillion)] bg-transparent text-[var(--foreground)] rounded-l-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

const Badge = React.forwardRef<
  HTMLSpanElement,
  BadgeProps
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Component = asChild ? Slot : "span";
  return (
    <Component
      className={cn(badgeVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export { Badge, badgeVariants };