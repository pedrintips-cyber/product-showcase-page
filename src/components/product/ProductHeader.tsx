import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, Search, ShoppingBag } from "lucide-react";

type ProductHeaderProps = {
  brandName: string;
};

export function ProductHeader({ brandName }: ProductHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="container flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-md border bg-surface text-surface-foreground",
              "shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <a href="#" className="group inline-flex items-center gap-2">
            <span
              className={cn(
                "grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground",
                "shadow-glow transition-transform group-hover:scale-[1.02]",
              )}
              aria-hidden="true"
            >
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">{brandName}</div>
              <div className="text-xs text-muted-foreground">Página do produto</div>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="soft" className="hidden sm:inline-flex">
            Frete grátis acima de R$ 199
          </Badge>
          <Button variant="soft" size="icon" aria-label="Buscar">
            <Search />
          </Button>
          <Button variant="outline" className="hidden sm:inline-flex">
            Ajuda
          </Button>
        </div>
      </div>
    </header>
  );
}
