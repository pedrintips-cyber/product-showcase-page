import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CreditCard, Headphones, ShieldCheck, Truck } from "lucide-react";

type StoreFooterProps = {
  brandName: string;
};

export function StoreFooter({ brandName }: StoreFooterProps) {
  return (
    <footer className="mt-14 border-t bg-background safe-bottom">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="text-lg font-semibold tracking-tight">{brandName}</div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Uma página de produto com cara de loja completa — feita pra vender com confiança.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="soft" className="gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Compra segura
              </Badge>
              <Badge variant="soft" className="gap-1">
                <Truck className="h-3.5 w-3.5" /> Rastreio
              </Badge>
              <Badge variant="soft" className="gap-1">
                <CreditCard className="h-3.5 w-3.5" /> 12x
              </Badge>
            </div>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="text-sm font-semibold">Institucional</div>
            {[
              "Quem somos",
              "Política de troca",
              "Privacidade",
              "Termos",
            ].map((label) => (
              <a key={label} href="#" className={cn("text-muted-foreground hover:text-foreground", "story-link")}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="grid gap-2 text-sm">
            <div className="text-sm font-semibold">Ajuda</div>
            {[
              "Rastrear pedido",
              "Dúvidas frequentes",
              "Garantia",
              "Fale com a gente",
            ].map((label) => (
              <a key={label} href="#" className={cn("text-muted-foreground hover:text-foreground", "story-link")}
              >
                {label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
              <Headphones className="h-4 w-4" /> Suporte rápido
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">Receba ofertas</div>
            <p className="text-sm text-muted-foreground">Cadastre seu e-mail e receba novidades.</p>
            <form className="flex gap-2">
              <input
                className={cn(
                  "h-10 flex-1 rounded-md border bg-background px-3 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
                placeholder="seuemail@exemplo.com"
                aria-label="E-mail"
                type="email"
              />
              <button
                type="button"
                className={cn(
                  "h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground",
                  "shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
              >
                Enviar
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} {brandName}. Todos os direitos reservados.</span>
          <span>Feito para mobile e desktop.</span>
        </div>
      </div>
    </footer>
  );
}
