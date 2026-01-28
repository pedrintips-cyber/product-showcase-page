import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, CreditCard, ShieldCheck, Truck } from "lucide-react";
import { StarRating } from "@/components/product/StarRating";

type Variant = {
  label: string;
  value: string;
};

type ProductPurchasePanelProps = {
  name: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewsCount: number;
  colors: Variant[];
  sizes: Variant[];
  selectedColor?: string;
  onColorChange?: (color: string) => void;
  onBuy?: (payload: { color: string; size: string; qty: number }) => void;
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function ProductPurchasePanel({
  name,
  price,
  compareAtPrice,
  rating,
  reviewsCount,
  colors,
  sizes,
  selectedColor,
  onColorChange,
  onBuy,
}: ProductPurchasePanelProps) {
  const [uncontrolledColor, setUncontrolledColor] = React.useState(colors[0]?.value ?? "");
  const [size, setSize] = React.useState(sizes[0]?.value ?? "");
  const [qty, setQty] = React.useState(1);

  const color = selectedColor ?? uncontrolledColor;
  const setColor = (next: string) => {
    setUncontrolledColor(next);
    onColorChange?.(next);
  };

  const discountPct = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : null;

  return (
    <section aria-label="Detalhes do produto" className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" className="gap-1">
            <Check className="h-3.5 w-3.5" /> Pronta entrega
          </Badge>
          <Badge variant="soft" className="gap-1">
            <Truck className="h-3.5 w-3.5" /> Envio em 24h
          </Badge>
          <Badge variant="soft" className="gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Garantia
          </Badge>
        </div>

        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{name}</h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <StarRating value={rating} />
            <span className="text-sm text-muted-foreground">({reviewsCount} avaliações)</span>
          </div>
          <span className="hidden sm:inline-block text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">Troca grátis em 7 dias</span>
        </div>
      </div>

      {/* Sem “card”: tudo direto no fundo */}
      <div className="space-y-5 border-t pt-5">

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Preço</div>
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-semibold tracking-tight">{formatBRL(price)}</div>
              {compareAtPrice ? (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground line-through">{formatBRL(compareAtPrice)}</div>
                  {discountPct !== null && <Badge variant="soft">-{discountPct}%</Badge>}
                </div>
              ) : null}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">ou 12x no cartão</div>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Cor</div>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "rounded-full border bg-background px-3 py-1.5 text-sm",
                    "transition-transform hover:scale-[1.02] active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    color === c.value ? "border-primary" : "border-border",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">Tamanho</div>
              <a href="#tabela" className="text-sm text-primary underline-offset-4 hover:underline">
                tabela
              </a>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {sizes.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSize(s.value)}
                  className={cn(
                    "rounded-md border bg-background px-2 py-2 text-sm",
                    "transition-transform hover:scale-[1.02] active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    size === s.value ? "border-primary" : "border-border",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-md border bg-background">
              <button
                type="button"
                className={cn(
                  "h-10 w-10 rounded-md text-foreground",
                  "transition-transform hover:scale-[1.02] active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
                aria-label="Diminuir quantidade"
                onClick={() => setQty((v) => Math.max(1, v - 1))}
              >
                −
              </button>
              <div className="min-w-10 text-center text-sm tabular-nums" aria-label={`Quantidade ${qty}`}>
                {qty}
              </div>
              <button
                type="button"
                className={cn(
                  "h-10 w-10 rounded-md text-foreground",
                  "transition-transform hover:scale-[1.02] active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
                aria-label="Aumentar quantidade"
                onClick={() => setQty((v) => Math.min(10, v + 1))}
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" /> Pagamento seguro
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="hero"
              size="xl"
              onClick={() => onBuy?.({ color, size, qty })}
              className="w-full"
            >
              Comprar agora
            </Button>
            <Button variant="outline" size="xl" className="w-full">
              Adicionar ao carrinho
            </Button>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              Envio com rastreio
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              Suporte por WhatsApp
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
