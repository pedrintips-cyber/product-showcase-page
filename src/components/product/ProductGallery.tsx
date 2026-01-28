import * as React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type ProductImage = {
  src: string;
  alt: string;
};

type ProductGalleryProps = {
  images: ProductImage[];
};

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selected, setSelected] = React.useState(0);

  return (
    <section aria-label="Galeria de fotos" className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border bg-surface shadow-elevated">
        <Carousel
          opts={{ align: "start", loop: true }}
          setApi={(api) => {
            if (!api) return;
            api.on("select", () => setSelected(api.selectedScrollSnap()));
          }}
        >
          <CarouselContent className="-ml-0">
            {images.map((img, idx) => (
              <CarouselItem key={idx} className="pl-0">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading={idx === 0 ? "eager" : "lazy"}
                  className="aspect-square w-full object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious
            className={cn(
              "left-3 top-1/2 -translate-y-1/2",
              "bg-surface/80 text-surface-foreground backdrop-blur",
            )}
            aria-label="Foto anterior"
          />
          <CarouselNext
            className={cn(
              "right-3 top-1/2 -translate-y-1/2",
              "bg-surface/80 text-surface-foreground backdrop-blur",
            )}
            aria-label="Próxima foto"
          />
        </Carousel>

        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/40" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {images.slice(0, 3).map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelected(idx)}
            className={cn(
              "group relative overflow-hidden rounded-xl border bg-surface",
              "transition-transform hover:scale-[1.01] active:scale-[0.99]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected === idx ? "ring-2 ring-primary" : "ring-0",
            )}
            aria-label={`Selecionar foto ${idx + 1}`}
          >
            <img src={img.src} alt={img.alt} loading="lazy" className="aspect-square w-full object-cover" />
            <div
              className={cn(
                "pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100",
                "bg-gradient-to-t from-foreground/10 to-transparent",
              )}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
