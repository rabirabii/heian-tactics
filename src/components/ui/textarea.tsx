import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex min-h-20 w-full border border-[var(--border-ink)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] rounded-[var(--radius-medium)] placeholder:text-[var(--text-secondary)] hover:border-[var(--border-ink)] focus:border-transparent focus-visible:outline-2 focus-visible:outline-[var(--accent-vermillion)] focus-visible:outline-offset-[3px] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
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

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  asChild?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "textarea";
    return (
      <Component
        className={cn(textareaVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };