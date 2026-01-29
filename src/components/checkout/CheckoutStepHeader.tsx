import * as React from "react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

type Props = {
  step: Step;
};

const steps: Array<{ id: Step; label: string }> = [
  { id: 1, label: "Entrega" },
  { id: 2, label: "Frete" },
  { id: 3, label: "Revisão & Pix" },
];

export function CheckoutStepHeader({ step }: Props) {
  const value = (step / 3) * 100;

  return (
    <section aria-label="Progresso do checkout" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-tight">Etapa {step} de 3</p>
          <p className="text-sm text-muted-foreground">Finalize em poucos passos.</p>
        </div>

        <ol className="flex items-center gap-2 text-xs text-muted-foreground">
          {steps.map((s, idx) => (
            <li key={s.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "whitespace-nowrap",
                  s.id === step && "text-foreground",
                  s.id < step && "text-foreground/80",
                )}
              >
                {s.label}
              </span>
              {idx < steps.length - 1 && <span aria-hidden="true">•</span>}
            </li>
          ))}
        </ol>
      </div>

      <Progress value={value} className="h-2" />
    </section>
  );
}
