import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const selectVariants = cva(
  "flex h-10 w-full items-center justify-between border border-[var(--border-ink)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] rounded-[var(--radius-medium)] hover:border-[var(--border-ink)] focus:border-transparent focus-visible:outline-2 focus-visible:outline-[var(--accent-vermillion)] focus-visible:outline-offset-[3px] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        default: "border-[var(--border-ink)] bg-[var(--surface)] text-[var(--foreground)]",
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

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "select";
    return (
      <Component
        className={cn(selectVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Select.displayName = "Select";

const SelectTrigger = Select;

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "border border-[var(--border-ink)] rounded-[var(--radius-medium)] bg-[var(--surface)] text-[var(--foreground)] shadow-lg p-1 z-50 overflow-hidden",
        className
      )}
      {...props}
    />
  )
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-2.5 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface)] cursor-pointer rounded-[var(--radius-small)] transition-colors",
        className
      )}
      {...props}
    />
  )
);
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectContent, SelectItem };