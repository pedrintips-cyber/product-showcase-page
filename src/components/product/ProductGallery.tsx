import * as React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
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
  const apiRef = React.useRef<CarouselApi | null>(null);

  React.useEffect(() => {
    setSelected(0);
    apiRef.current?.scrollTo(0);
  }, [images]);

  return (
    <section aria-label="Galeria de fotos" className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-border/60">
        <Carousel
          opts={{ align: "start", loop: true }}
          setApi={(api) => {
            if (!api) return;
            apiRef.current = api;
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
                  className="aspect-[3/4] w-full object-contain bg-background"
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious
            className={cn(
              "left-3 top-1/2 -translate-y-1/2",
              "bg-background text-foreground",
            )}
            aria-label="Foto anterior"
          />
          <CarouselNext
            className={cn(
              "right-3 top-1/2 -translate-y-1/2",
              "bg-background text-foreground",
            )}
            aria-label="Próxima foto"
          />
        </Carousel>
      </div>

      {images.length > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelected(idx);
                apiRef.current?.scrollTo(idx);
              }}
              aria-label={`Ir para foto ${idx + 1}`}
              className={cn(
                "h-2 w-2 rounded-full transition-transform",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selected === idx ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-4 gap-3">
        {images.slice(0, 4).map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setSelected(idx);
              apiRef.current?.scrollTo(idx);
            }}
            className={cn(
              "group relative overflow-hidden rounded-xl",
              "transition-transform hover:scale-[1.01] active:scale-[0.99]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected === idx ? "ring-2 ring-primary" : "ring-1 ring-border/40",
            )}
            aria-label={`Selecionar foto ${idx + 1}`}
          >
            <img src={img.src} alt={img.alt} loading="lazy" className="aspect-[3/4] w-full object-contain bg-background" />
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
