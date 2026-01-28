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
        // Flat: sem painel/card. Mantém apenas hierarquia e respiro.
        "space-y-2 sm:space-y-3",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          {hint ? <p className="text-[11px] text-muted-foreground sm:text-xs">{hint}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>

      <div className="border-b pb-3 sm:pb-4">{children}</div>
    </section>
  );
}
