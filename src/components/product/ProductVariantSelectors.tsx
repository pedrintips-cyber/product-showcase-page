import * as React from "react";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { OptionGroup } from "@/components/product/OptionGroup";

type Variant = {
  label: string;
  value: string;
};

type ColorSelectorProps = {
  colors: Variant[];
  value: string;
  onChange: (value: string) => void;
};

export function ColorSelector({ colors, value, onChange }: ColorSelectorProps) {
  return (
    <OptionGroup title="Cor" hint="Escolha a cor antes de finalizar" className="bg-background">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v)}
        className="flex flex-wrap justify-start gap-2"
      >
        {colors.map((c) => (
          <ToggleGroupItem
            key={c.value}
            value={c.value}
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full px-3",
              "data-[state=on]:shadow-none",
            )}
            aria-label={`Cor ${c.label}`}
          >
            {c.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </OptionGroup>
  );
}

type SizeSelectorProps = {
  sizes: Variant[];
  value: string;
  onChange: (value: string) => void;
  action?: React.ReactNode;
};

export function SizeSelector({ sizes, value, onChange, action }: SizeSelectorProps) {
  return (
    <OptionGroup title="Tamanho" hint="Se ficar entre dois, escolha o maior" action={action} className="bg-background">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v)}
        className="grid w-full grid-cols-4 gap-2 sm:grid-cols-6"
      >
        {sizes.map((s) => (
          <ToggleGroupItem
            key={s.value}
            value={s.value}
            variant="outline"
            size="sm"
            className={cn(
              "h-10 w-full justify-center rounded-md",
              "data-[state=on]:shadow-none",
            )}
            aria-label={`Tamanho ${s.label}`}
          >
            {s.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </OptionGroup>
  );
}
