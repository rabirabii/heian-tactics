import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  sky: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  rose: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  zinc: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
};

export function Badge({
  className,
  variant = "zinc",
  ...props
}: React.ComponentProps<"span"> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
