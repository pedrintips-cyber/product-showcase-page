import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  price: number;
};

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function CheckoutUpsell({ checked, onCheckedChange, price }: Props) {
  return (
    <section aria-label="Adicionar conjunto" className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-tight">Leve o conjunto</h2>
          <p className="text-sm text-muted-foreground">
            Adicione o Top para combinar com a legging.
          </p>
        </div>

        <div className="text-right">
          <div className="text-sm font-medium tracking-tight">+ {money(price)}</div>
          <div className="text-xs text-muted-foreground">uma vez</div>
        </div>
      </div>

      <label className="flex items-start gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          className="mt-0.5"
        />
        <span className="grid gap-1">
          <span className="text-sm font-medium">Adicionar Top (+{money(price)})</span>
          <span className="text-sm text-muted-foreground">
            Mais sustentação e visual completo — você escolhe depois tamanho/cor no WhatsApp.
          </span>
        </span>
      </label>
    </section>
  );
}
