import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "outline" | "success" | "warning" }) {
  const styles = {
    default: "bg-primary/15 text-primary-foreground/90 border-primary/20",
    secondary: "bg-secondary text-secondary-foreground border-transparent",
    outline: "border-border text-foreground",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200",
    warning: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-100",
  }[variant];
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles,
        className
      )}
      {...props}
    />
  );
}
