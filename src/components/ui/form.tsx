import * as React from "react";
import { Input } from "./input";
import { Label } from "./label";
import { Select } from "./select";
import { Textarea } from "./textarea";

export { Input, Label, Select, Textarea };

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) {
    return null;
  }

  return <p className="mt-1 text-xs font-bold text-[var(--accent-vermillion)] font-mono">{children}</p>;
}
