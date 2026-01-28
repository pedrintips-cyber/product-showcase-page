import * as React from "react";

type Props = {
  title: string;
  items: Array<{ label: string; value: string }>;
};

export function CheckoutOrderSummary({ title, items }: Props) {
  return (
    <section aria-label={title} className="space-y-3">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      <div className="space-y-2">
        {items.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="tracking-tight">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
