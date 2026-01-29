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
import { CheckoutStepHeader } from "@/components/checkout/CheckoutStepHeader";
import { CheckoutStepActions } from "@/components/checkout/CheckoutStepActions";
import { CheckoutMobileSummaryBar } from "@/components/checkout/CheckoutMobileSummaryBar";

import { useIsMobile } from "@/hooks/use-mobile";

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

type Step = 1 | 2 | 3;

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as CheckoutState;

  const isMobile = useIsMobile();

  const [addTop, setAddTop] = React.useState(false);
  const [step, setStep] = React.useState<Step>(1);

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

  const summaryItems = [
    { label: "Subtotal", value: money(product.unitPrice * product.qty) },
    { label: "Top", value: addTop ? money(upsellTopPrice) : "—" },
    { label: "Frete", value: shippingPrice === 0 ? "Grátis" : money(shippingPrice) },
    { label: "Total", value: money(total) },
  ];

  const onSubmit = (values: FormValues) => {
    // Demo Pix: só confirma no frontend por enquanto.
    toast.success("Checkout pronto (demo)", {
      description: `Cliente: ${values.name} • CEP: ${values.cep} • Frete: ${values.shipping === "sedex" ? "Sedex 24h" : "Transportadora 1–3d"} • Top: ${addTop ? "Sim" : "Não"} • Total: ${money(total)}`,
    });
  };

  const inputClass = "h-12 px-4 text-base";

  const goNext = async () => {
    if (step === 1) {
      const ok = await form.trigger(["name", "phone", "cep", "number", "address"], { shouldFocus: true });
      if (!ok) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      const ok = await form.trigger(["shipping"], { shouldFocus: true });
      if (!ok) return;
      setStep(3);
      return;
    }

    // step 3: submit handled by form
  };

  const goBack = () => {
    if (step === 1) return;
    setStep((prev) => (prev === 3 ? 2 : 1));
  };

  return (
    <div className="min-h-screen bg-background">
      <ProductHeader brandName={BRAND} />

      <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Checkout</h1>
          <div className="text-sm text-muted-foreground">
            <Link to="/" className="underline underline-offset-4">
              Voltar ao produto
            </Link>
          </div>
        </header>

        <Separator className="my-4 sm:my-6" />

        <CheckoutStepHeader step={step} />

        <Separator className="my-4 sm:my-6" />

        <div className="grid gap-6 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-20 sm:pb-0">
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

            {step === 1 && (
              <section aria-label="Dados para entrega" className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold tracking-tight">Entrega</h2>
                  <p className="text-sm text-muted-foreground">Preencha por partes — depois você escolhe o frete.</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    autoComplete="name"
                    placeholder="Seu nome completo"
                    autoFocus
                    className={inputClass}
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
                    className={inputClass}
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
                      className={inputClass}
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
                      className={inputClass}
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
                    className={inputClass}
                    {...form.register("address")}
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.address.message}</p>
                  )}
                </div>

                <Separator />

                <CheckoutUpsell
                  checked={addTop}
                  onCheckedChange={setAddTop}
                  price={upsellTopPrice}
                  imageSrc={upsellTopImage}
                  imageAlt="Top Seamless preto"
                />
              </section>
            )}

            {step === 2 && (
              <section aria-label="Frete" className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold tracking-tight">Frete</h2>
                  <p className="text-sm text-muted-foreground">Escolha a opção para calcular o total.</p>
                </div>

                <CheckoutShipping
                  value={form.watch("shipping")}
                  onChange={(v) => form.setValue("shipping", v as FormValues["shipping"], { shouldValidate: true })}
                  sedexPrice={sedexPrice}
                  carrierPrice={carrierPrice}
                />
                {form.formState.errors.shipping && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.shipping.message}</p>
                )}
              </section>
            )}

            {step === 3 && (
              <section aria-label="Revisão" className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold tracking-tight">Revisão</h2>
                  <p className="text-sm text-muted-foreground">Confirme tudo antes de gerar o Pix.</p>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Nome</p>
                  <p className="tracking-tight">{form.getValues("name") || "—"}</p>
                  <Separator />
                  <p className="text-muted-foreground">Telefone</p>
                  <p className="tracking-tight">{form.getValues("phone") || "—"}</p>
                  <Separator />
                  <p className="text-muted-foreground">Endereço</p>
                  <p className="tracking-tight">
                    {form.getValues("address") ? (
                      <>
                        {form.getValues("address")} • Nº {form.getValues("number")} • CEP {form.getValues("cep")}
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                  <Separator />
                  <p className="text-muted-foreground">Frete</p>
                  <p className="tracking-tight">{form.watch("shipping") === "sedex" ? "Sedex (24h)" : "Transportadora (1–3 dias úteis)"}</p>
                  <Separator />
                  <p className="text-muted-foreground">Top</p>
                  <p className="tracking-tight">{addTop ? "Sim (conjunto)" : "Não"}</p>
                </div>
              </section>
            )}

            <div className="sticky bottom-0 -mx-4 border-t border-border bg-background px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
              <CheckoutStepActions
                step={step}
                canGoBack={step !== 1}
                isLastStep={step === 3}
                onBack={goBack}
                onNext={goNext}
              />
            </div>
          </form>

          {!isMobile && (
            <aside className="space-y-6 lg:sticky lg:top-24">
              <CheckoutOrderSummary title="Total" items={summaryItems} />

              <div className="flex flex-col gap-2">
                <Button type="button" variant="outline" onClick={() => navigate("/")}
                >
                  Voltar ao produto
                </Button>
              </div>
            </aside>
          )}
        </div>
      </main>

      {isMobile && <CheckoutMobileSummaryBar title="Total" items={summaryItems} totalValue={money(total)} />}

      <StoreFooter brandName={BRAND} />
    </div>
  );
}
