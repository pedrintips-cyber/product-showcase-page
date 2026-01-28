import { cn } from "@/lib/utils";
import { StarRating } from "@/components/product/StarRating";

type Review = {
  name: string;
  date: string;
  rating: number;
  title: string;
  body: string;
};

type ReviewsSectionProps = {
  reviews: Review[];
  average: number;
  count: number;
};

export function ReviewsSection({ reviews, average, count }: ReviewsSectionProps) {
  return (
    <section aria-label="Avaliações" className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Avaliações</h2>
          <div className="flex items-center gap-2">
            <StarRating value={average} />
            <span className="text-sm text-muted-foreground">
              {average.toFixed(1)} • {count} avaliações
            </span>
          </div>
        </div>
        <a href="#" className="text-sm text-primary underline-offset-4 hover:underline">
          Ver todas
        </a>
      </header>

      <div className="grid gap-6 border-t pt-6 lg:grid-cols-3">
        {reviews.slice(0, 3).map((r, idx) => (
          <div key={idx} className={cn("space-y-4", idx === 0 ? "" : "")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.date}</div>
              </div>
              <StarRating value={r.rating} size="sm" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-sm font-semibold">{r.title}</div>
              <p className="text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
