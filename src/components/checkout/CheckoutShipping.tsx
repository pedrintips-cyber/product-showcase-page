import * as React from "react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ShippingValue = "sedex" | "carrier";

type Props = {
  value: ShippingValue;
  onChange: (value: ShippingValue) => void;
  sedexPrice: number;
  carrierPrice: number;
};

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function CheckoutShipping({ value, onChange, sedexPrice, carrierPrice }: Props) {
  return (
    <section aria-label="Frete" className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-tight">Frete</h2>
          <p className="text-sm text-muted-foreground">Por enquanto, valores fixos (vamos calcular por CEP depois).</p>
        </div>
      </div>

      <RadioGroup value={value} onValueChange={(v) => onChange(v as ShippingValue)} className="grid gap-3">
        <label className="flex items-start gap-3">
          <RadioGroupItem value="carrier" className="mt-0.5" />
          <span className="grid gap-1">
            <span className="text-sm font-medium">Transportadora (1–3 dias úteis)</span>
            <span className="text-sm text-muted-foreground">
              {carrierPrice === 0 ? "Grátis" : money(carrierPrice)}
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3">
          <RadioGroupItem value="sedex" className="mt-0.5" />
          <span className="grid gap-1">
            <span className="text-sm font-medium">Sedex (24h) — upgrade</span>
            <span className="text-sm text-muted-foreground">{money(sedexPrice)}</span>
          </span>
        </label>
      </RadioGroup>
    </section>
  );
}
