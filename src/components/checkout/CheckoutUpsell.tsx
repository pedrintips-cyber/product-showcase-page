import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { AspectRatio } from "@/components/ui/aspect-ratio";

type Props = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  price: number;
  imageSrc: string;
  imageAlt: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function CheckoutUpsell({ checked, onCheckedChange, price, imageSrc, imageAlt }: Props) {
  return (
    <section aria-label="Adicionar conjunto" className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-tight">Complete o conjunto</h2>
          <p className="text-sm text-muted-foreground">
            Leve o Top Seamless junto com a legging — melhora a sustentação e fecha o look.
          </p>
        </div>

        <div className="text-right">
          <div className="text-sm font-medium tracking-tight">+ {money(price)}</div>
          <div className="text-xs text-muted-foreground">uma vez</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[128px_1fr] sm:items-start">
        <div className="overflow-hidden rounded-md border">
          <AspectRatio ratio={1}>
            <img
              src={imageSrc}
              alt={imageAlt}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </AspectRatio>
        </div>

        <label className="flex items-start gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          className="mt-0.5"
        />
        <span className="grid gap-1">
            <span className="text-sm font-medium">Adicionar Top Seamless (+{money(price)})</span>
            <span className="text-sm text-muted-foreground">
              Item extra no pedido (não é taxa). Se marcar, entra no total automaticamente.
            </span>
        </span>
        </label>
      </div>
    </section>
  );
}
