import * as React from "react";
import { cn } from "@/lib/utils";

type OptionGroupProps = {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function OptionGroup({ title, hint, action, children, className }: OptionGroupProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        "rounded-lg border bg-accent/40 p-4",
        "space-y-3",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>

      <div>{children}</div>
    </section>
  );
}
