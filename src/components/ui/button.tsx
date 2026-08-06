import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-bg)] text-[var(--color-ink)] hover:bg-[var(--color-accent)]/20",
        destructive: "bg-[var(--color-bg)] text-[var(--color-ink)] hover:bg-[var(--color-accent)]/20",
        outline: "bg-[var(--color-bg)] text-[var(--color-ink)] hover:bg-[var(--color-accent)]/20",
        secondary: "bg-[var(--color-bg)] text-[var(--color-ink)] hover:bg-[var(--color-accent)]/20",
      },
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={cn(
        buttonVariants({ variant, size }),
        "btn-base",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button };