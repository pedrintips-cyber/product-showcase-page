import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import logoBlumi from "@/assets/logo-blumi.png";

type ProductHeaderProps = {
  brandName: string;
};

export function ProductHeader({ brandName }: ProductHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="border-b border-border/60">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-2 sm:px-6 lg:px-10">
          <p className="text-center text-[11px] font-medium tracking-wide text-muted-foreground">
            Moda essencial • Caimento premium • Envio rápido
          </p>
        </div>
      </div>

      <div className="mx-auto flex min-h-16 w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 sm:min-h-20 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <a href="#" className="group inline-flex items-center gap-3">
            <span
              className={cn(
                "grid h-11 w-11 place-items-center overflow-hidden rounded-xl border bg-background sm:h-12 sm:w-12",
                "transition-transform group-hover:scale-[1.02]",
              )}
              aria-hidden="true"
            >
              <img
                src={logoBlumi}
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </span>
            <div className="leading-tight">
              <div className="font-serif text-base font-semibold tracking-tight sm:text-lg">{brandName}</div>
              <div className="text-xs text-muted-foreground sm:text-sm">Loja feminina • Essentials</div>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="soft" className="hidden sm:inline-flex">
            Frete grátis acima de R$ 199
          </Badge>
          <Button variant="soft" size="icon" aria-label="Buscar" className="h-9 w-9 sm:h-10 sm:w-10">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button variant="outline" className="hidden sm:inline-flex">
            Ajuda
          </Button>
        </div>
      </div>
    </header>
  );
}
