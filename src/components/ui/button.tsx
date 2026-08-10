import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-medium)] text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-[var(--border-ink)] border-l-[3px] border-l-[var(--accent-vermillion)] bg-[var(--surface)] text-[var(--foreground)] hover:brightness-110 rounded-l-none",
        destructive: "border-[var(--border-ink)] border-l-[3px] border-l-[var(--accent-vermillion)] bg-[var(--surface)] text-[var(--foreground)] hover:brightness-110 rounded-l-none",
        outline: "border border-[var(--border-ink)] bg-[var(--surface)] hover:bg-[var(--surface)] text-[var(--foreground)]",
        secondary: "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border-ink)] hover:bg-[var(--surface)]",
        ghost: "hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8 text-base",
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };