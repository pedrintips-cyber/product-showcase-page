import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, Search } from "lucide-react";
import logoBlumi from "@/assets/logo-blumi.png";

type ProductHeaderProps = {
  brandName: string;
};

export function ProductHeader({ brandName }: ProductHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground sm:h-10 sm:w-10",
              "transition-transform hover:scale-[1.02] active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            aria-label="Abrir menu"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <a href="#" className="group inline-flex items-center gap-2">
            <span
              className={cn(
                "grid h-9 w-9 place-items-center overflow-hidden rounded-xl border bg-background sm:h-10 sm:w-10",
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
              <div className="font-serif text-sm font-semibold tracking-tight">{brandName}</div>
              <div className="text-xs text-muted-foreground">Página do produto</div>
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
