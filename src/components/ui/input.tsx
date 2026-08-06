import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-bg)] text-[var(--color-ink)]",
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

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, variant, asChild = false, ...props }, ref) => {
  const Component = asChild ? Slot : "input";
  return (
    <Component
      className={cn(
        inputVariants({ variant }),
        "input-base",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };