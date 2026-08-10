import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-10 w-full border border-[var(--border-ink)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] rounded-[var(--radius-medium)] placeholder:text-[var(--text-secondary)] hover:border-[var(--border-ink)] focus:border-transparent focus-visible:outline-2 focus-visible:outline-[var(--accent-vermillion)] focus-visible:outline-offset-[3px] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border-ink)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  asChild?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "input";
    return (
      <Component
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };