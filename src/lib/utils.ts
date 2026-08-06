import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: Math.abs(value) >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}