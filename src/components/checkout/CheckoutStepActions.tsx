import * as React from "react";

import { Button } from "@/components/ui/button";

type Step = 1 | 2 | 3;

type Props = {
  step: Step;
  canGoBack: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  submitLabel?: string;
};

export function CheckoutStepActions({
  canGoBack,
  isLastStep,
  onBack,
  onNext,
  isNextDisabled,
  submitLabel = "Gerar Pix (demo)",
}: Props) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Button type="button" variant="outline" onClick={onBack} disabled={!canGoBack}>
        Voltar
      </Button>

      <Button type={isLastStep ? "submit" : "button"} variant="hero" size="xl" onClick={onNext} disabled={isNextDisabled}>
        {isLastStep ? submitLabel : "Avançar"}
      </Button>
    </div>
  );
}
