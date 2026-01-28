import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

type StarRatingProps = {
  value: number; // 0..5
  className?: string;
  size?: "sm" | "md";
};

export function StarRating({ value, className, size = "md" }: StarRatingProps) {
  const s = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;

  return (
    <div className={cn("inline-flex items-center gap-1", className)} aria-label={`${value} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const isFull = idx < full;
        const isHalf = idx === full && hasHalf;
        return (
          <span key={idx} className="relative">
            <Star className={cn(s, "text-muted-foreground")} aria-hidden="true" />
            {(isFull || isHalf) && (
              <span
                className={cn("absolute inset-0 overflow-hidden", isHalf ? "w-1/2" : "w-full")}
                aria-hidden="true"
              >
                <Star className={cn(s, "text-primary")} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
