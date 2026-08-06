import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const selectVariants = cva(
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

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {
  asChild?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, variant, asChild = false, ...props }, ref) => {
  const Component = asChild ? Slot : "select";
  return (
    <Component
      className={cn(
        selectVariants({ variant }),
        "select-base",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Select.displayName = "Select";

export { Select };