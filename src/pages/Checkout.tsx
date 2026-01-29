import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { toast } from "sonner";
import { ProductHeader } from "@/components/product/ProductHeader";
import { StoreFooter } from "@/components/product/StoreFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { CheckoutShipping } from "@/components/checkout/CheckoutShipping";
import { CheckoutUpsell } from "@/components/checkout/CheckoutUpsell";

import upsellTopImage from "@/assets/upsell-top.jpg";

const BRAND = "Blumi";

type CheckoutState = {
  product?: {
    name: string;
    unitPrice: number;
    color: string;
    size: string;
    qty: number;
  };
};

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120, "Nome muito longo"),
  phone: z
    .string()
    .trim()
    .min(8, "Informe um telefone")
    .max(20, "Telefone muito longo"),
  cep: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido")
    .max(9),
  number: z.string().trim().min(1, "Número é obrigatório").max(10, "Número muito longo"),
  address: z.string().trim().min(5, "Informe o endereço").max(160, "Endereço muito longo"),
  shipping: z.enum(["sedex", "carrier"], { required_error: "Selecione o frete" }),
});

type FormValues = z.infer<typeof schema>;

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as CheckoutState;

  const [addTop, setAddTop] = React.useState(false);

  const product =
    state.product ??
    ({
      name: "Legging Seamless Cintura Alta — Modeladora",
      unitPrice: 25.99,
      color: "black",
      size: "M",
      qty: 1,
    } satisfies NonNullable<CheckoutState["product"]>);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      cep: "",
      number: "",
      address: "",
      shipping: "carrier",
    },
    mode: "onBlur",
  });

  // Frete: transportadora grátis + sedex como upgrade (ajustável depois para cálculo por CEP).
  const sedexPrice = 9.9;
  const carrierPrice = 0;
  const shippingPrice = form.watch("shipping") === "sedex" ? sedexPrice : carrierPrice;

  const upsellTopPrice = 13;
  const subtotal = product.unitPrice * product.qty + (addTop ? upsellTopPrice : 0);
  const total = subtotal + shippingPrice;

  const onSubmit = (values: FormValues) => {
    // Demo Pix: só confirma no frontend por enquanto.
    toast.success("Checkout pronto (demo)", {
      description: `Cliente: ${values.name} • CEP: ${values.cep} • Frete: ${values.shipping === "sedex" ? "Sedex 24h" : "Transportadora 1–3d"} • Top: ${addTop ? "Sim" : "Não"} • Total: ${money(total)}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <ProductHeader brandName={BRAND} />

      <main className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Checkout</h1>
          <div className="text-sm text-muted-foreground">
            <Link to="/" className="underline underline-offset-4">
              Voltar ao produto
            </Link>
          </div>
        </header>

        <Separator className="my-6 sm:my-8" />

        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <section aria-label="Resumo do pedido" className="space-y-3">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold tracking-tight">Seu pedido</h2>
                <p className="text-sm text-muted-foreground">Confira os detalhes antes de gerar o Pix.</p>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium tracking-tight">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.qty}× {money(product.unitPrice)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Cor: {product.color} • Tamanho: {product.size}</p>
              </div>
            </section>

            <section aria-label="Dados para entrega" className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold tracking-tight">Entrega</h2>
                <p className="text-sm text-muted-foreground">Preencha para calcular e confirmar o envio.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Seu nome completo"
                  autoFocus
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(DDD) 90000-0000"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="00000-000"
                    {...form.register("cep")}
                  />
                  {form.formState.errors.cep && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.cep.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    inputMode="numeric"
                    autoComplete="address-line2"
                    placeholder="Ex.: 123"
                    {...form.register("number")}
                  />
                  {form.formState.errors.number && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.number.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  autoComplete="street-address"
                  placeholder="Rua, bairro, complemento (se tiver)"
                  {...form.register("address")}
                />
                {form.formState.errors.address && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.address.message}</p>
                )}
              </div>
            </section>

            <Separator />

            <CheckoutUpsell
              checked={addTop}
              onCheckedChange={setAddTop}
              price={upsellTopPrice}
              imageSrc={upsellTopImage}
              imageAlt="Top Seamless preto"
            />
          </form>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <CheckoutShipping
              value={form.watch("shipping")}
              onChange={(v) => form.setValue("shipping", v as FormValues["shipping"], { shouldValidate: true })}
              sedexPrice={sedexPrice}
              carrierPrice={carrierPrice}
            />
            {form.formState.errors.shipping && (
              <p className="text-sm font-medium text-destructive">{form.formState.errors.shipping.message}</p>
            )}

            <Separator />

            <CheckoutOrderSummary
              title="Total"
              items={[
                { label: "Subtotal", value: money(product.unitPrice * product.qty) },
                { label: "Top", value: addTop ? money(upsellTopPrice) : "—" },
                { label: "Frete", value: shippingPrice === 0 ? "Grátis" : money(shippingPrice) },
                { label: "Total", value: money(total) },
              ]}
            />

            <div className="flex flex-col gap-2">
              <Button type="submit" variant="hero" size="xl">
                Gerar Pix (demo)
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/")}
              >
                Voltar
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <StoreFooter brandName={BRAND} />
    </div>
  );
}
